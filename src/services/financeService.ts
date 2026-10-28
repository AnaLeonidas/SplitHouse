import { supabase } from './supabase';
import {
  DespesaDB,
  RateioDespesaDB,
  PagamentoAcertoDB,
  CreateExpenseInput,
  ExpenseDetailsData,
  DebtBalanceItem,
  FinancialReportData,
} from '../types/database';

/**
 * Utilitário para formatar números no padrão monetário brasileiro (ex.: "1.250,50").
 */
const formatMoney = (val: number): string => {
  return Number(val || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Utilitário para formatar data ISO (YYYY-MM-DD ou timestamptz) para o formato brasileiro DD/MM/YYYY.
 */
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'A definir';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

/**
 * Serviço responsável pela gestão de despesas, rateios automáticos e acertos financeiros no Supabase.
 */
export const financeService = {
  /**
   * Consulta a lista de despesas coletivas registradas para a moradia.
   *
   * @param moradiaId Identificador único da moradia.
   * @param statusFilter Filtro opcional por aba ('Todos', 'Pendentes', 'Pagas', 'Recorrentes').
   */
  async fetchExpenses(moradiaId: string, statusFilter: string = 'Todos') {
    if (!moradiaId) return [];

    let query = supabase
      .from('despesas')
      .select('*')
      .eq('moradia_id', moradiaId)
      .order('criado_em', { ascending: false });

    if (statusFilter === 'Pendentes') {
      query = query.eq('status', 'pendente');
    } else if (statusFilter === 'Pagas') {
      query = query.eq('status', 'pago');
    } else if (statusFilter === 'Recorrentes') {
      query = query.eq('status', 'recorrente');
    }

    const { data, error } = await query;
    if (error) {
      console.warn('financeService: Erro ao carregar despesas:', error.message);
      return [];
    }

    return (data as DespesaDB[]).map((d) => ({
      id: d.id,
      titulo: d.titulo,
      categoria: d.categoria,
      valor: formatMoney(d.valor_total),
      rawValor: d.valor_total,
      vencimento: formatDate(d.data_vencimento),
      status: d.status,
      pagadorId: d.pagador_id,
      comprovanteUrl: d.comprovante_url,
    }));
  },

  /**
   * Registra uma nova despesa coletiva e divide automaticamente o valor entre os moradores ativos.
   *
   * @param input Dados cadastrais da nova despesa.
   * @param memberUserIds Lista de UUIDs dos moradores ativos que participarão do rateio.
   */
  async createExpense(input: CreateExpenseInput, memberUserIds: string[]) {
    if (!input.moradiaId || !input.pagadorId) {
      throw new Error('Moradia e pagador são obrigatórios para registrar uma despesa.');
    }

    if (!memberUserIds || memberUserIds.length === 0) {
      throw new Error('Nenhum morador selecionado para a divisão da conta.');
    }

    // 1. Inserir a despesa principal
    const { data: despesaCriada, error: despesaError } = await supabase
      .from('despesas')
      .insert({
        moradia_id: input.moradiaId,
        titulo: input.titulo,
        categoria: input.categoria || 'Geral',
        valor_total: input.valorTotal,
        data_vencimento: input.dataVencimento || null,
        tipo_divisao: input.tipoDivisao || 'igualitaria',
        pagador_id: input.pagadorId,
        status: 'pendente',
        comprovante_url: input.comprovanteUrl || null,
      })
      .select()
      .single();

    if (despesaError || !despesaCriada) {
      throw new Error(despesaError?.message || 'Falha ao registrar a despesa no banco.');
    }

    // 2. Calcular fração igualitária por morador
    const valorParte = parseFloat((input.valorTotal / memberUserIds.length).toFixed(2));

    // 3. Gerar rateios individuais para cada morador
    const rateiosParaInserir = memberUserIds.map((userId) => {
      const isPagador = userId === input.pagadorId;
      return {
        despesa_id: despesaCriada.id,
        usuario_id: userId,
        valor_parte: valorParte,
        status: isPagador ? 'pago' : 'pendente',
        pago_em: isPagador ? new Date().toISOString() : null,
      };
    });

    const { error: rateiosError } = await supabase
      .from('rateios_despesa')
      .insert(rateiosParaInserir);

    if (rateiosError) {
      console.warn('financeService: Erro ao inserir rateios:', rateiosError.message);
    }

    return despesaCriada as DespesaDB;
  },

  /**
   * Consulta os dados detalhados de uma despesa com os comprovantes e a situação de cada morador.
   *
   * @param despesaId Identificador único da despesa.
   */
  async getExpenseDetails(despesaId: string): Promise<ExpenseDetailsData | null> {
    if (!despesaId) return null;

    const { data: despesa, error: despesaError } = await supabase
      .from('despesas')
      .select('*')
      .eq('id', despesaId)
      .single();

    if (despesaError || !despesa) {
      return null;
    }

    // Buscar pagador
    const { data: pagadorPerfil } = await supabase
      .from('perfis')
      .select('nome_completo')
      .eq('id', despesa.pagador_id)
      .single();

    // Buscar rateios
    const { data: rateios } = await supabase
      .from('rateios_despesa')
      .select('*')
      .eq('despesa_id', despesaId);

    // Buscar perfis dos membros participantes
    const userIds = (rateios || []).map((r: RateioDespesaDB) => r.usuario_id);
    let perfisMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: perfis } = await supabase
        .from('perfis')
        .select('id, nome_completo')
        .in('id', userIds);

      (perfis || []).forEach((p: { id: string; nome_completo: string }) => {
        perfisMap[p.id] = p.nome_completo;
      });
    }

    const members = (rateios || []).map((r: RateioDespesaDB) => {
      const nome = perfisMap[r.usuario_id] || 'Morador';
      const initials = nome
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return {
        id: r.id,
        userId: r.usuario_id,
        name: r.usuario_id === despesa.pagador_id ? `${nome} (Pagador)` : nome,
        initials,
        role: r.usuario_id === despesa.pagador_id ? 'Efetuou o pagamento' : undefined,
        amount: r.valor_parte,
        isPaid: r.status === 'pago',
      };
    });

    return {
      id: despesa.id,
      title: despesa.titulo,
      amount: `R$ ${formatMoney(despesa.valor_total)}`,
      rawAmount: despesa.valor_total,
      dueDate: formatDate(despesa.data_vencimento),
      rawDueDate: despesa.data_vencimento,
      categoria: despesa.categoria,
      payerId: despesa.pagador_id,
      payerName: pagadorPerfil?.nome_completo || 'Morador',
      receiptUrl: despesa.comprovante_url,
      receiptName: despesa.comprovante_url ? 'comprovante_anexo.pdf' : undefined,
      status: despesa.status,
      members,
    };
  },

  /**
   * Calcula o balanço financeiro líquido e as pendências bilaterais do morador na república.
   *
   * @param moradiaId Identificador da moradia.
   * @param currentUserId Identificador do usuário logado.
   */
  async fetchSettleUpData(moradiaId: string, currentUserId: string): Promise<{
    netBalance: string;
    isPositive: boolean;
    debts: DebtBalanceItem[];
  }> {
    if (!moradiaId || !currentUserId) {
      return { netBalance: 'R$ 0,00', isPositive: true, debts: [] };
    }

    // 1. Buscar todas as despesas da casa
    const { data: despesas } = await supabase
      .from('despesas')
      .select('id, titulo, pagador_id')
      .eq('moradia_id', moradiaId);

    const despesasMap = new Map((despesas || []).map((d) => [d.id, d]));
    const despesasIds = (despesas || []).map((d) => d.id);

    if (despesasIds.length === 0) {
      return { netBalance: 'R$ 0,00', isPositive: true, debts: [] };
    }

    // 2. Buscar rateios pendentes dessas despesas
    const { data: rateios } = await supabase
      .from('rateios_despesa')
      .select('*')
      .in('despesa_id', despesasIds)
      .eq('status', 'pendente');

    // 3. Buscar perfis dos membros da moradia para nomes e iniciais
    const { data: membros } = await supabase
      .from('membros_moradia')
      .select('usuario_id')
      .eq('moradia_id', moradiaId)
      .eq('status', 'aprovado');

    const memberIds = (membros || []).map((m) => m.usuario_id);
    let namesMap: Record<string, string> = {};

    if (memberIds.length > 0) {
      const { data: perfis } = await supabase
        .from('perfis')
        .select('id, nome_completo')
        .in('id', memberIds);

      (perfis || []).forEach((p: { id: string; nome_completo: string }) => {
        namesMap[p.id] = p.nome_completo;
      });
    }

    // 4. Balanços cruzados: quanto cada morador deve ao usuário logado vs quanto o usuário logado deve
    // balanceWithOthers[otherUserId] > 0 => otherUserId deve a currentUserId
    // balanceWithOthers[otherUserId] < 0 => currentUserId deve a otherUserId
    const balanceWithOthers: Record<string, number> = {};

    (rateios || []).forEach((r: RateioDespesaDB) => {
      const desp = despesasMap.get(r.despesa_id);
      if (!desp) return;

      const pagador = desp.pagador_id;
      const devedor = r.usuario_id;

      if (pagador === currentUserId && devedor !== currentUserId) {
        // Alguém deve para o usuário logado
        balanceWithOthers[devedor] = (balanceWithOthers[devedor] || 0) + Number(r.valor_parte);
      } else if (devedor === currentUserId && pagador !== currentUserId) {
        // Usuário logado deve para alguém
        balanceWithOthers[pagador] = (balanceWithOthers[pagador] || 0) - Number(r.valor_parte);
      }
    });

    let totalLiquido = 0;
    const debtItems: DebtBalanceItem[] = [];

    Object.entries(balanceWithOthers).forEach(([otherId, bal]) => {
      totalLiquido += bal;
      if (Math.abs(bal) < 0.01) return;

      const otherName = namesMap[otherId] || 'Morador';
      const initials = otherName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const deveAoUsuario = bal > 0;
      debtItems.push({
        id: otherId,
        debtorId: otherId,
        debtorName: otherName,
        debtorInitials: initials,
        debtorStatus: deveAoUsuario ? 'Deve a você' : 'Você deve a ele(a)',
        debtAmount: `R$ ${formatMoney(Math.abs(bal))}`,
        rawAmount: bal,
        refText: deveAoUsuario
          ? 'Pendente de acerto e comprovação'
          : 'Transfira o valor para regularizar seu saldo',
        isSettled: false,
      });
    });

    const isPos = totalLiquido >= 0;
    const netFormatted = `R$ ${formatMoney(Math.abs(totalLiquido))}${totalLiquido < 0 ? ' (Devedor)' : ''}`;

    return {
      netBalance: totalLiquido === 0 ? 'R$ 0,00' : netFormatted,
      isPositive: isPos,
      debts: debtItems,
    };
  },

  /**
   * Registra a quitação ou transferência de acerto entre dois moradores.
   *
   * @param input Parâmetros de pagamento bilateral.
   */
  async informPayment(input: {
    moradiaId: string;
    devedorId: string;
    credorId: string;
    valor: number;
    comprovanteUrl?: string;
  }) {
    const { data, error } = await supabase
      .from('pagamentos_acerto')
      .insert({
        moradia_id: input.moradiaId,
        devedor_id: input.devedorId,
        credor_id: input.credorId,
        valor: input.valor,
        comprovante_url: input.comprovanteUrl || null,
        metodo_pagamento: 'pix',
        status: 'aguardando_aprovacao',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Falha ao registrar comprovante de pagamento.');
    }

    return data as PagamentoAcertoDB;
  },

  /**
   * Confirma ou rejeita o recebimento de uma transferência de acerto.
   *
   * @param pagamentoId Identificador do pagamento.
   * @param isApproved Se o credor aprovou o recebimento.
   */
  async confirmPayment(pagamentoId: string, isApproved: boolean) {
    const status = isApproved ? 'confirmado' : 'rejeitado';
    const { data, error } = await supabase
      .from('pagamentos_acerto')
      .update({
        status,
        confirmado_em: isApproved ? new Date().toISOString() : null,
      })
      .eq('id', pagamentoId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Falha ao atualizar status do pagamento.');
    }

    return data as PagamentoAcertoDB;
  },

  /**
   * Consolida os dados financeiros mensais para o relatório da república.
   *
   * @param moradiaId Identificador da moradia.
   */
  async fetchFinancialReport(moradiaId: string): Promise<FinancialReportData> {
    if (!moradiaId) {
      return { totalAmount: '0,00', averagePerResident: '0,00', history: [] };
    }

    // 1. Totalizar despesas da casa
    const { data: despesas } = await supabase
      .from('despesas')
      .select('*')
      .eq('moradia_id', moradiaId)
      .order('criado_em', { ascending: false });

    const total = (despesas || []).reduce((acc, cur) => acc + Number(cur.valor_total || 0), 0);

    // 2. Contar moradores aprovados
    const { count: membersCount } = await supabase
      .from('membros_moradia')
      .select('*', { count: 'exact', head: true })
      .eq('moradia_id', moradiaId)
      .eq('status', 'aprovado');

    const activeMembers = membersCount && membersCount > 0 ? membersCount : 1;
    const media = total / activeMembers;

    // 3. Montar histórico de movimentações recentes
    const history = (despesas || []).slice(0, 10).map((d: DespesaDB) => ({
      id: d.id,
      title: d.titulo,
      subtitle: `${d.categoria} • ${formatDate(d.data_vencimento || d.criado_em)}`,
      value: `R$ ${formatMoney(d.valor_total)}`,
      isIncome: false,
    }));

    return {
      totalAmount: formatMoney(total),
      averagePerResident: formatMoney(media),
      history,
    };
  },
};

