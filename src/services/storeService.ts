import { supabase } from './supabase';
import { notificationsService } from './notificationsService';
import {
  CategoriaRecompensa,
  ProposeRewardInput,
  RecompensaLojaDB,
  RedeemRewardInput,
} from '../types/database';
import { StoreItem } from '../screens/store/StoreScreen';

/**
 * Recompensas padrão (mantido vazio para não exibir itens fictícios/mockados).
 */
export const DEFAULT_STORE_ITEMS: Omit<StoreItem, 'id'>[] = [];

/**
 * Resultado da transação de resgate de uma recompensa na loja.
 */
export interface RedeemRewardResult {
  /** Indica se o resgate e o débito de moedas foram concluídos com êxito */
  success: boolean;
  /** Novo saldo de moedas do morador após o débito */
  newBalance: number;
  /** Identificador opcional do registro gerado em 'resgates_recompensa' */
  redemptionId?: string;
}

/**
 * Normaliza a categoria para inserção em conformidade com a constraint do banco (sem acentos).
 *
 * @param cat Nome da categoria informada na interface.
 * @returns Categoria normalizada sem acentos para persistência no PostgreSQL.
 */
export function normalizeCategoryForDb(cat?: string): string {
  if (!cat) return 'Folga';
  const clean = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean === 'Convivencia') return 'Convivencia';
  if (clean === 'Bonus') return 'Bonus';
  if (clean === 'Folga') return 'Folga';
  return 'Outros';
}

/**
 * Converte a categoria vinda do banco para exibição visual com acentuação correta.
 *
 * @param cat Categoria bruta armazenada no banco de dados.
 * @returns Categoria padronizada e acentuada para exibição na loja.
 */
export function mapDbCategoryToVisual(cat?: string): 'Folga' | 'Convivência' | 'Bônus' {
  if (cat === 'Convivencia' || cat === 'Convivência') return 'Convivência';
  if (cat === 'Bonus' || cat === 'Bônus') return 'Bônus';
  return 'Folga';
}

/**
 * Converte um registro bruto da tabela 'recompensas_loja' para a interface visual StoreItem.
 *
 * @param row Registro bruto retornado da tabela 'recompensas_loja'.
 * @returns Item formatado com ícone, categoria acentuada e metadados visuais.
 */
export function mapRowToStoreItem(row: RecompensaLojaDB): StoreItem {
  let icon: 'minus-circle' | 'tv' | 'sofa' | 'pizza' = 'minus-circle';
  if (row.tipo_icone === 'tv' || row.tipo_icone === 'sofa' || row.tipo_icone === 'pizza') {
    icon = row.tipo_icone;
  } else if (row.categoria === 'Convivência' || (row.categoria as any) === 'Convivencia') {
    icon = 'tv';
  } else if (row.categoria === 'Bônus' || (row.categoria as any) === 'Bonus') {
    icon = 'pizza';
  }

  const visualCategory = mapDbCategoryToVisual(row.categoria);

  return {
    id: row.id,
    title: row.titulo,
    category: visualCategory,
    subtitle: row.subtitulo || `${visualCategory} da casa`,
    cost: row.custo_moedas,
    description: (row as any).descricao_regras || row.descricao || 'Sem descrição cadastrada.',
    availability: (row as any).texto_disponibilidade || row.disponibilidade || 'Disponível',
    iconType: icon,
  };
}

/**
 * Serviço responsável pelas operações da loja de recompensas da república no Supabase.
 */
export const storeService = {
  /**
   * Consulta os itens ativos da loja da moradia no Supabase.
   * Não exibe itens mockados nem realiza seed de dados falsos.
   *
   * @param moradiaId UUID da moradia.
   * @returns Lista de recompensas ativas da república.
   */
  async fetchStoreItems(moradiaId: string): Promise<StoreItem[]> {
    if (!moradiaId) {
      return [];
    }

    const { data, error } = await supabase
      .from('recompensas_loja')
      .select('*')
      .eq('moradia_id', moradiaId)
      .order('custo_moedas', { ascending: true });

    if (error) {
      console.warn('storeService.fetchStoreItems: erro do Supabase:', error.message);
      throw new Error(error.message || 'Falha ao carregar os itens da loja.');
    }

    // Filtra em memória para suportar tanto bancos com a coluna 'ativo' quanto 'status'
    const inactiveStatuses = new Set(['recusada', 'inativa', 'cancelada', 'pendente']);
    const activeRows = (data || []).filter(
      (r: any) =>
        r.ativo !== false &&
        !inactiveStatuses.has(String(r.status || '').toLowerCase()) &&
        !inactiveStatuses.has(String(r.status_aprovacao || '').toLowerCase())
    );

    return activeRows.map(mapRowToStoreItem);
  },

  /**
   * Salva uma nova proposta de recompensa sugerida por um morador.
   *
   * @param input Dados do formulário de proposição.
   * @param userId UUID do morador autor.
   * @param moradiaId UUID da moradia.
   * @param userName Nome do morador para notificação.
   * @returns Recompensa criada e formatada.
   */
  async proposeReward(
    input: ProposeRewardInput,
    userId: string,
    moradiaId: string,
    userName?: string
  ): Promise<StoreItem> {
    const costInt = Number(input.cost);
    if (!input.title.trim()) {
      throw new Error('Informe o título da recompensa.');
    }
    if (!Number.isInteger(costInt) || costInt <= 0) {
      throw new Error('O custo em moedas deve ser um número inteiro maior que zero.');
    }

    const payloadCanonical = {
      moradia_id: moradiaId,
      titulo: input.title.trim(),
      subtitulo: input.subtitle || `${input.category} da casa`,
      categoria: input.category,
      custo_moedas: costInt,
      descricao: input.description.trim() || null,
      disponibilidade: input.limit || 'Disponível',
      tipo_icone: input.iconType || (input.category === 'Folga' ? 'minus-circle' : 'tv'),
      ativo: true,
      status_aprovacao: 'aprovada' as const,
      criado_por: userId,
    };

    let { data, error } = await supabase
      .from('recompensas_loja')
      .insert(payloadCanonical)
      .select()
      .single();

    if (error && (error.code === '42703' || error.code === 'PGRST204' || error.code === '23502' || error.code === '23514')) {
      const rowCompat = {
        moradia_id: moradiaId,
        titulo: input.title.trim(),
        subtitulo: input.subtitle || `${input.category} da casa`,
        categoria: normalizeCategoryForDb(input.category),
        custo_moedas: costInt,
        descricao_regras: input.description.trim() || 'Sem descrição informada.',
        texto_disponibilidade: input.limit || 'Disponível',
        tipo_icone: input.iconType || (input.category === 'Folga' ? 'minus-circle' : 'tv'),
        status: 'ativa',
        proposta_por: userId,
      };
      const retry = await supabase.from('recompensas_loja').insert(rowCompat).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('storeService.proposeReward: Erro ao propor recompensa:', error);
      throw new Error(error?.message || 'Falha ao salvar recompensa no banco de dados.');
    }

    // Notifica os moradores sobre a nova recompensa disponível
    try {
      const { data: membros } = await supabase
        .from('membros_moradia')
        .select('usuario_id')
        .eq('moradia_id', moradiaId)
        .eq('status', 'aprovado');
      const memberIds = (membros || []).map((m: any) => m.usuario_id);

      await notificationsService.notifyUsers(memberIds, {
        moradiaId,
        senderId: userId,
        tipo: 'Recompensa',
        categoryFilter: 'Geral',
        titulo: 'Nova Recompensa na Loja!',
        descricao: `${userName || 'Um morador'} adicionou "${input.title}" por ${input.cost} moedas.`,
        actionText: 'Ver na loja',
        hasCoinIcon: true,
      });
    } catch {
      // Notificação não-bloqueante
    }

    return mapRowToStoreItem(data as RecompensaLojaDB);
  },

  /**
   * Realiza o resgate de uma recompensa da loja:
   * 1. Valida saldo suficiente do morador em 'membros_moradia'.
   * 2. Debita o valor das moedas no saldo do membro.
   * 3. Registra a transação em 'resgates_recompensa'.
   * 4. Gera notificação para o usuário.
   *
   * @param input Dados da transação de resgate.
   * @returns Objeto com sucesso e saldo atualizado de moedas.
   */
  async redeemReward(
    input: RedeemRewardInput
  ): Promise<RedeemRewardResult> {
    const { rewardId, userId, moradiaId, rewardTitle } = input;

    // 1. Verifica recompensa ativa no banco (custo autoritativo e limite por ciclo)
    const { data: recompensaRow, error: rewardError } = await supabase
      .from('recompensas_loja')
      .select('*')
      .eq('id', rewardId)
      .eq('moradia_id', moradiaId)
      .maybeSingle();

    if (rewardError || !recompensaRow) {
      throw new Error('Recompensa não encontrada nesta moradia.');
    }
    const inactiveStatuses = new Set(['recusada', 'inativa', 'cancelada', 'pendente']);
    if (
      recompensaRow.ativo === false ||
      inactiveStatuses.has(String((recompensaRow as any).status || '').toLowerCase()) ||
      inactiveStatuses.has(String(recompensaRow.status_aprovacao || '').toLowerCase())
    ) {
      throw new Error('Esta recompensa não está mais disponível para resgate.');
    }

    const actualCost = Number(recompensaRow.custo_moedas || input.cost);
    const effectiveTitle = recompensaRow.titulo || rewardTitle;
    const limiteCiclo = Number(recompensaRow.limite_por_ciclo || 0);

    if (limiteCiclo > 0) {
      const { count: usedCount, error: countError } = await supabase
        .from('resgates_recompensa')
        .select('id', { count: 'exact', head: true })
        .eq('recompensa_id', rewardId)
        .eq('moradia_id', moradiaId)
        .eq('usuario_id', userId)
        .neq('status', 'cancelado');

      if (!countError && usedCount !== null && usedCount >= limiteCiclo) {
        throw new Error(`Você já atingiu o limite de ${limiteCiclo} resgate(s) para esta recompensa neste ciclo.`);
      }
    }

    // 2. Busca vínculo do membro e saldo atual de moedas
    const { data: membro, error: memberError } = await supabase
      .from('membros_moradia')
      .select('id, moedas')
      .eq('moradia_id', moradiaId)
      .eq('usuario_id', userId)
      .eq('status', 'aprovado')
      .maybeSingle();

    if (memberError || !membro) {
      throw new Error('Não foi possível verificar seu saldo de moedas na república.');
    }

    const currentCoins = membro.moedas || 0;
    if (currentCoins < actualCost) {
      throw new Error(
        `Saldo insuficiente. Você possui ${currentCoins} moedas, mas a recompensa custa ${actualCost} moedas.`
      );
    }
    const updatedCoins = currentCoins - actualCost;

    // 3. Registra o resgate na tabela 'resgates_recompensa' usando esquema canônico primeiro
    let redemptionId: string | undefined;
    let resgateInsertError: any = null;

    let { data: resgate, error: resgateError } = await supabase
      .from('resgates_recompensa')
      .insert({
        recompensa_id: rewardId,
        moradia_id: moradiaId,
        usuario_id: userId,
        custo_moedas: actualCost,
        status: 'ativo',
      })
      .select('id')
      .single();

    if (resgateError && (resgateError.code === '42703' || resgateError.code === 'PGRST204')) {
      const retry = await supabase
        .from('resgates_recompensa')
        .insert({
          recompensa_id: rewardId,
          moradia_id: moradiaId,
          usuario_id: userId,
          moedas_gastas: actualCost,
          status: 'ativo',
        })
        .select('id')
        .single();
      resgate = retry.data;
      resgateInsertError = retry.error;
    } else {
      resgateInsertError = resgateError;
    }

    if (resgateInsertError || !resgate) {
      throw new Error(
        'Falha ao registrar resgate da recompensa: ' +
          (resgateInsertError?.message || 'Erro desconhecido no banco.')
      );
    }

    redemptionId = resgate.id;

    // 4. Debita moedas no banco verificando se o saldo ainda é suficiente
    const { data: updatedMember, error: updateError } = await supabase
      .from('membros_moradia')
      .update({ moedas: updatedCoins })
      .eq('id', membro.id)
      .gte('moedas', actualCost)
      .select('id, moedas')
      .single();

    if (updateError || !updatedMember) {
      await supabase.from('resgates_recompensa').delete().eq('id', redemptionId);
      throw new Error(
        'Falha ao debitar moedas da conta: ' +
          (updateError?.message || 'Saldo indisponível no momento do débito.')
      );
    }

    // 5. Cria notificação de confirmação para o próprio morador (sem senderId para não filtrá-lo)
    try {
      await notificationsService.notifyUsers([userId], {
        moradiaId,
        tipo: 'Recompensa',
        categoryFilter: 'Finanças',
        titulo: 'Recompensa Resgatada!',
        descricao: `Você resgatou "${effectiveTitle}" por ${actualCost} moedas. Seu benefício está ativo no ciclo atual.`,
        hasCoinIcon: true,
      });
    } catch {
      // Notificação não-bloqueante
    }

    return {
      success: true,
      newBalance: updatedCoins,
      redemptionId,
    };
  },

  /**
   * Obtém o saldo em tempo real de moedas de um morador na moradia.
   *
   * @param moradiaId UUID da moradia.
   * @param userId UUID do morador consultado.
   * @returns Quantidade atual de moedas disponíveis para resgate.
   */
  async getUserCoins(moradiaId: string, userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('membros_moradia')
        .select('moedas')
        .eq('moradia_id', moradiaId)
        .eq('usuario_id', userId)
        .maybeSingle();

      if (error || !data) return 0;
      return data.moedas || 0;
    } catch {
      return 0;
    }
  },
};

