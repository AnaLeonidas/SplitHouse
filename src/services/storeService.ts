import { supabase } from './supabase';
import {
  CategoriaRecompensa,
  ProposeRewardInput,
  RecompensaLojaDB,
  RedeemRewardInput,
} from '../types/database';
import { StoreItem } from '../screens/store/StoreScreen';

/**
 * Recompensas padrão do SplitHouse para inicialização da loja da moradia.
 */
export const DEFAULT_STORE_ITEMS: Omit<StoreItem, 'id'>[] = [
  {
    title: 'Isenção da louça',
    category: 'Folga',
    subtitle: 'Fim de semana livre',
    cost: 150,
    description:
      'Fique livre da louça de almoço e jantar no sábado e domingo. A escala pula para o próximo.',
    availability: '2 vagas no mês',
    iconType: 'minus-circle',
  },
  {
    title: 'Escolha do filme',
    category: 'Convivência',
    subtitle: 'Sessão de sexta-feira',
    cost: 80,
    description: 'Controle remoto exclusivo da TV da sala na sessão coletiva.',
    availability: 'Disponível semanalmente',
    iconType: 'tv',
  },
  {
    title: 'Rei do sofá retrátil',
    category: 'Convivência',
    subtitle: 'Reserva por 7 dias',
    cost: 200,
    description: 'Preferência assegurada no assento principal da sala durante a semana.',
    availability: '1 morador por ciclo',
    iconType: 'sofa',
  },
  {
    title: 'Pizza coletiva',
    category: 'Bônus',
    subtitle: 'Fundo comum da casa',
    cost: 350,
    description: 'Pizza grande com borda recheada financiada pela caixinha de bônus da república.',
    availability: '1 disponível',
    iconType: 'pizza',
  },
];

/**
 * Converte um registro bruto da tabela 'recompensas_loja' para a interface visual StoreItem.
 */
export function mapRowToStoreItem(row: RecompensaLojaDB): StoreItem {
  let icon: 'minus-circle' | 'tv' | 'sofa' | 'pizza' = 'minus-circle';
  if (row.tipo_icone === 'tv' || row.tipo_icone === 'sofa' || row.tipo_icone === 'pizza') {
    icon = row.tipo_icone;
  } else if (row.categoria === 'Convivência') {
    icon = 'tv';
  } else if (row.categoria === 'Bônus') {
    icon = 'pizza';
  }

  return {
    id: row.id,
    title: row.titulo,
    category: row.categoria,
    subtitle: row.subtitulo || `${row.categoria} da casa`,
    cost: row.custo_moedas,
    description: row.descricao || 'Sem descrição cadastrada.',
    availability: row.disponibilidade || 'Disponível',
    iconType: icon,
  };
}

/**
 * Serviço responsável pelas operações da loja de recompensas da república no Supabase.
 */
export const storeService = {
  /**
   * Consulta os itens ativos da loja da moradia.
   * Caso a república ainda não possua recompensas cadastradas, insere os itens padrão automaticamente.
   *
   * @param moradiaId UUID da moradia.
   * @returns Lista de recompensas ativas formatadas para a interface.
   */
  async fetchStoreItems(moradiaId: string): Promise<StoreItem[]> {
    try {
      if (!moradiaId) {
        return DEFAULT_STORE_ITEMS.map((item, index) => ({
          ...item,
          id: String(index + 1),
        }));
      }

      const { data, error } = await supabase
        .from('recompensas_loja')
        .select('*')
        .eq('moradia_id', moradiaId)
        .eq('ativo', true)
        .eq('status_aprovacao', 'aprovada')
        .order('custo_moedas', { ascending: true });

      if (error) {
        console.warn('storeService.fetchStoreItems: aviso do Supabase, aplicando fallback:', error.message);
        return DEFAULT_STORE_ITEMS.map((item, index) => ({
          ...item,
          id: String(index + 1),
        }));
      }

      // Se a moradia for nova e ainda não tiver itens salvos no banco, insere o catálogo padrão
      if (!data || data.length === 0) {
        try {
          const seeds = DEFAULT_STORE_ITEMS.map((item) => ({
            moradia_id: moradiaId,
            titulo: item.title,
            subtitulo: item.subtitle,
            categoria: item.category as CategoriaRecompensa,
            custo_moedas: item.cost,
            descricao: item.description,
            disponibilidade: item.availability,
            tipo_icone: item.iconType,
            ativo: true,
            status_aprovacao: 'aprovada',
          }));

          const { data: inserted } = await supabase
            .from('recompensas_loja')
            .insert(seeds)
            .select();

          if (inserted && inserted.length > 0) {
            return (inserted as RecompensaLojaDB[]).map(mapRowToStoreItem);
          }
        } catch (seedErr) {
          console.warn('storeService: Não foi possível realizar seed automático:', seedErr);
        }

        return DEFAULT_STORE_ITEMS.map((item, index) => ({
          ...item,
          id: String(index + 1),
        }));
      }

      return (data as RecompensaLojaDB[]).map(mapRowToStoreItem);
    } catch (err) {
      console.warn('storeService.fetchStoreItems: exceção capturada:', err);
      return DEFAULT_STORE_ITEMS.map((item, index) => ({
        ...item,
        id: String(index + 1),
      }));
    }
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
    if (!input.title.trim()) {
      throw new Error('Informe o título da recompensa.');
    }
    if (!input.cost || Number(input.cost) <= 0) {
      throw new Error('O custo em moedas deve ser maior que zero.');
    }

    const payload = {
      moradia_id: moradiaId,
      titulo: input.title.trim(),
      subtitulo: input.subtitle || `${input.category} da casa`,
      categoria: input.category,
      custo_moedas: Number(input.cost),
      descricao: input.description.trim() || null,
      disponibilidade: input.limit || 'Disponível',
      tipo_icone: input.iconType || (input.category === 'Folga' ? 'minus-circle' : 'tv'),
      ativo: true,
      status_aprovacao: 'aprovada' as const,
      criado_por: userId,
    };

    const { data, error } = await supabase
      .from('recompensas_loja')
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error('storeService.proposeReward: Erro ao propor recompensa:', error);
      throw new Error(error?.message || 'Falha ao salvar recompensa no banco de dados.');
    }

    // Notifica os moradores sobre a nova recompensa disponível
    try {
      await supabase.from('notificacoes').insert({
        moradia_id: moradiaId,
        usuario_id: userId,
        tipo: 'Recompensa',
        category_filter: 'Geral',
        titulo: 'Nova Recompensa na Loja!',
        descricao: `${userName || 'Um morador'} adicionou "${input.title}" por ${input.cost} moedas.`,
        action_text: 'Ver na loja',
        has_coin_icon: true,
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
  ): Promise<{ success: boolean; newBalance: number; redemptionId?: string }> {
    const { rewardId, userId, moradiaId, cost, rewardTitle } = input;

    // 1. Busca vínculo do membro e saldo atual de moedas
    const { data: membro, error: memberError } = await supabase
      .from('membros_moradia')
      .select('id, moedas')
      .eq('moradia_id', moradiaId)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (memberError || !membro) {
      throw new Error('Não foi possível verificar seu saldo de moedas na república.');
    }

    const currentCoins = membro.moedas || 0;
    if (currentCoins < cost) {
      throw new Error(
        `Saldo insuficiente. Você possui ${currentCoins} moedas, mas a recompensa custa ${cost} moedas.`
      );
    }

    const updatedCoins = currentCoins - cost;

    // 2. Debita moedas no banco
    const { error: updateError } = await supabase
      .from('membros_moradia')
      .update({ moedas: updatedCoins })
      .eq('id', membro.id);

    if (updateError) {
      throw new Error('Falha ao debitar moedas da conta: ' + updateError.message);
    }

    // 3. Registra o resgate na tabela 'resgates_recompensa'
    let redemptionId: string | undefined;
    try {
      const { data: resgate } = await supabase
        .from('resgates_recompensa')
        .insert({
          recompensa_id: rewardId,
          moradia_id: moradiaId,
          usuario_id: userId,
          custo_moedas: cost,
          status: 'ativo',
        })
        .select('id')
        .single();

      if (resgate) {
        redemptionId = resgate.id;
      }
    } catch (resgateErr) {
      console.warn('storeService.redeemReward: Não foi possível registrar em resgates_recompensa:', resgateErr);
    }

    // 4. Cria notificação de confirmação do benefício ativo
    try {
      await supabase.from('notificacoes').insert({
        moradia_id: moradiaId,
        usuario_id: userId,
        tipo: 'Recompensa',
        category_filter: 'Finanças',
        titulo: 'Recompensa Resgatada!',
        descricao: `Você resgatou "${rewardTitle}" por ${cost} moedas. Seu benefício está ativo no ciclo atual.`,
        has_coin_icon: true,
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

