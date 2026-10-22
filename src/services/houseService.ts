import { supabase } from './supabase';
import {
  MembroMoradia,
  MembroMoradiaDB,
  MinhaMoradia,
  MoradiaDB,
  Perfil,
  RegraInput,
  RegraMoradiaDB,
} from '../types/database';

/**
 * Dados do formulário de cadastro de moradia (CreateHouseScreen).
 */
export interface CreateHouseInput {
  name: string;
  address: string;
  type: 'apartment' | 'house';
  residentsCount: string;
}

/**
 * Resultado da solicitação de entrada em uma moradia por código.
 */
export interface JoinHouseResult {
  moradiaId: string;
  moradiaNome: string;
}

/**
 * Converte erros do Supabase em Error com mensagem amigável.
 */
function toError(error: { message?: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

/**
 * Gera um código de convite no formato SPLIT-0000.
 */
function randomCode(): string {
  return `SPLIT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
}

/**
 * Obtém o UUID do usuário autenticado.
 *
 * @throws {Error} Se não houver sessão ativa.
 */
async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Usuário não autenticado.');
  }
  return data.user.id;
}

/**
 * Serviço responsável pelo cadastro e gerenciamento de moradias, convites,
 * moradores e regras da casa, usando diretamente as tabelas 'moradias',
 * 'membros_moradia' e 'regras_moradia' do Supabase.
 */
export const houseService = {
  /**
   * Cria a moradia, torna o usuário logado administrador aprovado e grava as regras iniciais.
   *
   * @param input Dados do formulário de cadastro.
   * @param rules Regras de convivência definidas no passo seguinte.
   * @returns {Promise<MoradiaDB>} Moradia criada, incluindo o código de convite.
   * @throws {Error} Se o usuário não estiver autenticado ou já pertencer a uma casa.
   */
  async createHouse(input: CreateHouseInput, rules: RegraInput[] = []): Promise<MoradiaDB> {
    const userId = await currentUserId();

    if (await this.getMyHouse()) {
      throw new Error('Você já participa de uma moradia ou aguarda aprovação.');
    }

    // Gera um código ainda não utilizado
    let codigo = randomCode();
    for (let i = 0; i < 10; i++) {
      const { data } = await supabase
        .from('moradias')
        .select('id')
        .eq('codigo_convite', codigo)
        .maybeSingle();
      if (!data) break;
      codigo = randomCode();
    }

    const qtd = parseInt(input.residentsCount, 10);
    const { data: moradia, error } = await supabase
      .from('moradias')
      .insert({
        nome: input.name.trim(),
        endereco: input.address.trim(),
        tipo: input.type === 'house' ? 'casa' : 'apartamento',
        estimativa_moradores: Number.isNaN(qtd) ? null : qtd,
        codigo_convite: codigo,
        criado_por: userId,
      })
      .select()
      .single();

    if (error || !moradia) {
      throw toError(error, 'Não foi possível cadastrar a moradia.');
    }

    const { error: memberError } = await supabase.from('membros_moradia').insert({
      moradia_id: moradia.id,
      usuario_id: userId,
      papel: 'admin',
      status: 'aprovado',
    });

    if (memberError) {
      await supabase.from('moradias').delete().eq('id', moradia.id);
      throw toError(memberError, 'Não foi possível vincular você à moradia.');
    }

    if (rules.length > 0) {
      try {
        await this.saveRules(moradia.id, rules);
      } catch {
        // A casa foi criada; as regras podem ser editadas depois.
      }
    }

    return moradia as MoradiaDB;
  },

  /**
   * Solicita entrada em uma moradia usando o código de convite (aguarda aprovação do admin).
   *
   * @param code Código no formato SPLIT-0000.
   * @throws {Error} Se o código for inválido ou o usuário já pertencer a uma casa.
   */
  async joinByCode(code: string): Promise<JoinHouseResult> {
    const userId = await currentUserId();

    const { data: moradia, error } = await supabase
      .from('moradias')
      .select('id, nome')
      .eq('codigo_convite', code.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      throw toError(error, 'Não foi possível buscar o código.');
    }
    if (!moradia) {
      throw new Error('Código de convite inválido.');
    }

    const { data: vinculos, error: vincError } = await supabase
      .from('membros_moradia')
      .select('id, moradia_id, status')
      .eq('usuario_id', userId);

    if (vincError) {
      throw toError(vincError, 'Não foi possível verificar seus vínculos.');
    }

    const existentes = (vinculos || []) as Pick<MembroMoradiaDB, 'id' | 'moradia_id' | 'status'>[];
    if (existentes.some((v) => v.status === 'aprovado')) {
      throw new Error('Você já participa de uma moradia.');
    }

    const mesmoLugar = existentes.find((v) => v.moradia_id === moradia.id);
    if (mesmoLugar) {
      if (mesmoLugar.status !== 'pendente') {
        const { error: upError } = await supabase
          .from('membros_moradia')
          .update({ status: 'pendente', papel: 'morador' })
          .eq('id', mesmoLugar.id);
        if (upError) throw toError(upError, 'Não foi possível reenviar a solicitação.');
      }
    } else {
      const { error: insError } = await supabase.from('membros_moradia').insert({
        moradia_id: moradia.id,
        usuario_id: userId,
        papel: 'morador',
        status: 'pendente',
      });
      if (insError) throw toError(insError, 'Não foi possível solicitar entrada.');
    }

    return { moradiaId: moradia.id, moradiaNome: moradia.nome };
  },

  /**
   * Obtém o vínculo atual do usuário logado (casa aprovada ou solicitação pendente).
   *
   * @returns {Promise<MinhaMoradia | null>} Vínculo atual, ou null se não houver.
   */
  async getMyHouse(): Promise<MinhaMoradia | null> {
    const userId = await currentUserId();

    const { data: vinculos, error } = await supabase
      .from('membros_moradia')
      .select('*')
      .eq('usuario_id', userId)
      .in('status', ['aprovado', 'pendente']);

    if (error) {
      throw toError(error, 'Não foi possível carregar sua moradia.');
    }

    const lista = (vinculos || []) as MembroMoradiaDB[];
    const vinculo = lista.find((v) => v.status === 'aprovado') || lista[0];
    if (!vinculo) return null;

    const { data: moradia, error: moradiaError } = await supabase
      .from('moradias')
      .select('*')
      .eq('id', vinculo.moradia_id)
      .single();

    if (moradiaError || !moradia) {
      throw toError(moradiaError, 'Não foi possível carregar os dados da moradia.');
    }

    const m = moradia as MoradiaDB;
    return {
      membro_id: vinculo.id,
      moradia_id: m.id,
      nome: m.nome,
      endereco: m.endereco,
      tipo: m.tipo,
      codigo_convite: m.codigo_convite,
      papel: vinculo.papel,
      status: vinculo.status,
    };
  },

  /**
   * Lista moradores aprovados e solicitações pendentes da moradia, com nome e e-mail do perfil.
   *
   * @param moradiaId UUID da moradia.
   */
  async listMembers(moradiaId: string): Promise<MembroMoradia[]> {
    const { data, error } = await supabase
      .from('membros_moradia')
      .select('*')
      .eq('moradia_id', moradiaId)
      .in('status', ['aprovado', 'pendente'])
      .order('entrou_em', { ascending: true });

    if (error) {
      throw toError(error, 'Não foi possível carregar os moradores.');
    }

    const membros = (data || []) as MembroMoradiaDB[];
    if (membros.length === 0) return [];

    const { data: perfis } = await supabase
      .from('perfis')
      .select('id, nome_completo, email')
      .in('id', membros.map((m) => m.usuario_id));

    const porId = new Map(
      ((perfis || []) as Pick<Perfil, 'id' | 'nome_completo' | 'email'>[]).map((p) => [p.id, p])
    );

    return membros
      .map((m) => ({
        ...m,
        nome: porId.get(m.usuario_id)?.nome_completo ?? null,
        email: porId.get(m.usuario_id)?.email ?? null,
      }))
      .sort((a, b) => Number(b.papel === 'admin') - Number(a.papel === 'admin'));
  },

  /**
   * Aprova ou recusa uma solicitação de entrada (somente administradores).
   *
   * @param membroId UUID do vínculo pendente em membros_moradia.
   * @param approve true para aprovar, false para recusar.
   */
  async respondRequest(membroId: string, approve: boolean): Promise<void> {
    const { error } = await supabase
      .from('membros_moradia')
      .update({ status: approve ? 'aprovado' : 'recusado' })
      .eq('id', membroId)
      .eq('status', 'pendente');

    if (error) {
      throw toError(error, 'Não foi possível responder à solicitação.');
    }
  },

  /**
   * Lista as regras de convivência da moradia em ordem de cadastro.
   *
   * @param moradiaId UUID da moradia.
   */
  async fetchRules(moradiaId: string): Promise<RegraMoradiaDB[]> {
    const { data, error } = await supabase
      .from('regras_moradia')
      .select('*')
      .eq('moradia_id', moradiaId)
      .order('numero_ordem', { ascending: true });

    if (error) {
      throw toError(error, 'Não foi possível carregar as regras.');
    }
    return (data || []) as RegraMoradiaDB[];
  },

  /**
   * Substitui o conjunto de regras da casa. Regras sem título são ignoradas.
   *
   * @param moradiaId UUID da moradia.
   * @param rules Novo conjunto de regras, na ordem desejada.
   */
  async saveRules(moradiaId: string, rules: RegraInput[]): Promise<void> {
    const validas = rules.filter((r) => r.titulo.trim());

    const { error: delError } = await supabase
      .from('regras_moradia')
      .delete()
      .eq('moradia_id', moradiaId);
    if (delError) {
      throw toError(delError, 'Não foi possível atualizar as regras.');
    }

    if (validas.length === 0) return;

    const { error } = await supabase.from('regras_moradia').insert(
      validas.map((r, i) => ({
        moradia_id: moradiaId,
        numero_ordem: i + 1,
        titulo: r.titulo.trim(),
        destaque: r.destaque?.trim() || null,
        descricao: r.descricao.trim() || r.destaque?.trim() || r.titulo.trim(),
      }))
    );
    if (error) {
      throw toError(error, 'Não foi possível salvar as regras.');
    }
  },

  /**
   * Remove o usuário da moradia (status 'saiu'), também usado para cancelar solicitação pendente.
   * Se for o único admin e restarem moradores aprovados, o mais antigo vira admin.
   *
   * @param moradiaId UUID da moradia.
   */
  async leaveHouse(moradiaId: string): Promise<void> {
    const userId = await currentUserId();

    const { data: meu, error } = await supabase
      .from('membros_moradia')
      .select('*')
      .eq('moradia_id', moradiaId)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (error || !meu) {
      throw toError(error, 'Você não participa desta moradia.');
    }

    const vinculo = meu as MembroMoradiaDB;
    const { error: upError } = await supabase
      .from('membros_moradia')
      .update({ status: 'saiu', papel: 'morador' })
      .eq('id', vinculo.id);
    if (upError) {
      throw toError(upError, 'Não foi possível sair da moradia.');
    }

    if (vinculo.status === 'aprovado' && vinculo.papel === 'admin') {
      const { data: restantes } = await supabase
        .from('membros_moradia')
        .select('id, papel')
        .eq('moradia_id', moradiaId)
        .eq('status', 'aprovado')
        .order('entrou_em', { ascending: true });

      const lista = (restantes || []) as Pick<MembroMoradiaDB, 'id' | 'papel'>[];
      if (lista.length > 0 && !lista.some((m) => m.papel === 'admin')) {
        await supabase.from('membros_moradia').update({ papel: 'admin' }).eq('id', lista[0].id);
      }
    }
  },
};
