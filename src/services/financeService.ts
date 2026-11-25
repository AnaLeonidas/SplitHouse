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
 * Fração customizada informada manualmente no rateio de uma despesa.
 */
export interface CustomSplitInput {
  /** UUID do morador participante da divisão */
  userId: string;
  /** Valor monetário atribuído a esse morador */
  amount: number;
}

/**
 * Item resumido de despesa coletiva formatado para listagem.
 */
export interface ExpenseSummaryItem {
  /** Identificador único da despesa (UUID) */
  id: string;
  /** Título descritivo da despesa */
  titulo: string;
  /** Categoria da despesa */
  categoria: string;
  /** Valor total formatado em reais (ex.: "120,00") */
  valor: string;
  /** Valor numérico bruto da despesa */
  rawValor: number;
  /** Data de vencimento formatada (DD/MM/YYYY) */
  vencimento: string;
  /** Situação atual de quitação da despesa */
  status: string;
  /** UUID do morador que realizou o pagamento inicial */
  pagadorId: string;
  /** URL pública do comprovante anexado, quando houver */
  comprovanteUrl?: string | null;
}

/**
 * Balanço consolidado de acertos bilaterais para exibição na tela de Acerto de Contas.
 */
export interface SettleUpData {
  /** Saldo líquido formatado em reais para o usuário logado */
  netBalance: string;
  /** Indica se o saldo líquido é positivo ou zerado */
  isPositive: boolean;
  /** Lista de pendências bilaterais em relação aos demais moradores */
  debts: DebtBalanceItem[];
}

/**
 * Registro de pagamento informado por morador aguardando validação do credor.
 */
export interface PendingPaymentItem {
  /** Identificador único da transferência informada (UUID) */
  id: string;
  /** UUID do morador devedor que realizou o pagamento */
  payerId: string;
  /** Nome completo do morador pagador */
  payerName: string;
  /** Iniciais do morador pagador para avatar */
  payerInitials: string;
  /** Método de pagamento informado (ex.: 'Transferência via Pix') */
  paymentMethod: string;
  /** Valor pago formatado em reais */
  amount: string;
  /** Descrição ou referência da transferência */
  reference: string;
  /** Data e hora de registro do pagamento formatadas */
  dateTime: string;
  /** URL pública do comprovante de transferência anexado, se existir */
  receiptUrl: string | null;
}

/**
 * Utilitário para formatar números no padrão monetário brasileiro (ex.: "1.250,50").
 *
 * @param val Valor numérico a ser formatado.
 * @returns Texto formatado com duas casas decimais no padrão pt-BR.
 */
const formatMoney = (val: number): string => {
  return Number(val || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Utilitário para formatar data ISO (YYYY-MM-DD ou timestamptz) para o formato brasileiro DD/MM/YYYY.
 *
 * @param dateString Data no formato ISO 8601 ou null/undefined.
 * @returns Data formatada em DD/MM/YYYY ou "A definir" se ausente.
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
   * @returns Lista formatada de despesas da moradia.
   */
  async fetchExpenses(moradiaId: string, statusFilter: string = 'Todos'): Promise<ExpenseSummaryItem[]> {
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
      throw new Error(error.message || 'Não foi possível carregar as despesas.');
    }

    return ((data || []) as DespesaDB[]).map((d) => ({
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
   * @param customSplits Frações customizadas por usuário para rateios fixos ou percentuais.
   * @returns Registro recém-criado da despesa no banco.
   */
  async createExpense(
    input: CreateExpenseInput,
    memberUserIds: string[],
    customSplits?: CustomSplitInput[]
  ) {
    if (!input.moradiaId || !input.pagadorId) {
      throw new Error('Moradia e pagador são obrigatórios para registrar uma despesa.');
    }
    if (!Number.isFinite(input.valorTotal) || input.valorTotal <= 0) {
      throw new Error('Informe um valor total positivo válido para a despesa.');
    }

    let normalizedCustomSplits: CustomSplitInput[] | undefined;
    if (customSplits && customSplits.length > 0) {
      const seen = new Set<string>();
      normalizedCustomSplits = [];
      for (const s of customSplits) {
        if (!s.userId || seen.has(s.userId)) {
          throw new Error('Moradores duplicados ou inválidos no rateio.');
        }
        if (!Number.isFinite(s.amount) || s.amount < 0) {
          throw new Error('Os valores individuais do rateio não podem ser negativos.');
        }
        seen.add(s.userId);
        normalizedCustomSplits.push(s);
      }
      const sumSplits = normalizedCustomSplits.reduce((acc, s) => acc + s.amount, 0);
      const diff = parseFloat((input.valorTotal - sumSplits).toFixed(2));
      const adjustedFirst = parseFloat((normalizedCustomSplits[0].amount + diff).toFixed(2));
      if (adjustedFirst < 0) {
        throw new Error('A soma das parcelas excede o valor total da despesa.');
      }
    }

    const dedupedMembers = Array.from(new Set(memberUserIds.filter(Boolean)));
    const targetUserIds = normalizedCustomSplits
      ? normalizedCustomSplits.map((s) => s.userId)
      : dedupedMembers;

    if (!targetUserIds || targetUserIds.length === 0) {
      throw new Error('Nenhum morador selecionado para a divisão da conta.');
    }

    const willAllBePaid = targetUserIds.every((uid) => uid === input.pagadorId);

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
        status: willAllBePaid ? 'pago' : 'pendente',
        comprovante_url: input.comprovanteUrl || null,
      })
      .select()
      .single();

    if (despesaError || !despesaCriada) {
      throw new Error(despesaError?.message || 'Falha ao registrar a despesa no banco.');
    }

    // 2. Gerar rateios individuais para cada morador
    let rateiosParaInserir: any[] = [];

    if (normalizedCustomSplits) {
      const sumSplits = normalizedCustomSplits.reduce((acc, s) => acc + s.amount, 0);
      const diff = parseFloat((input.valorTotal - sumSplits).toFixed(2));
      rateiosParaInserir = normalizedCustomSplits.map((split, index) => {
        const isPagador = split.userId === input.pagadorId;
        const adjustedAmount =
          index === 0 ? parseFloat((split.amount + diff).toFixed(2)) : parseFloat(split.amount.toFixed(2));
        return {
          despesa_id: despesaCriada.id,
          usuario_id: split.userId,
          valor_parte: Math.max(0, adjustedAmount),
          status: isPagador || adjustedAmount === 0 ? 'pago' : 'pendente',
          pago_em: isPagador || adjustedAmount === 0 ? new Date().toISOString() : null,
        };
      });
    } else {
      const count = targetUserIds.length;
      const equalShare = Math.floor((input.valorTotal / count) * 100) / 100;
      const remainder = parseFloat((input.valorTotal - equalShare * count).toFixed(2));
      rateiosParaInserir = targetUserIds.map((userId, index) => {
        const isPagador = userId === input.pagadorId;
        const valorParte = index === 0 ? parseFloat((equalShare + remainder).toFixed(2)) : equalShare;
        return {
          despesa_id: despesaCriada.id,
          usuario_id: userId,
          valor_parte: valorParte,
          status: isPagador ? 'pago' : 'pendente',
          pago_em: isPagador ? new Date().toISOString() : null,
        };
      });
    }

    const { error: rateiosError } = await supabase
      .from('rateios_despesa')
      .insert(rateiosParaInserir);

    if (rateiosError) {
      console.warn('financeService: Erro ao inserir rateios:', rateiosError.message);
      await supabase.from('despesas').delete().eq('id', despesaCriada.id);
      throw new Error(`Falha ao registrar a divisão da despesa: ${rateiosError.message}`);
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
      receiptName: despesa.comprovante_url ? 'Comprovante anexado' : undefined,
      status: despesa.status,
      members,
    };
  },

  /**
   * Calcula o balanço financeiro líquido e as pendências bilaterais do morador na república.
   *
   * @param moradiaId Identificador da moradia.
   * @param currentUserId Identificador do usuário logado.
   * @returns Balanço consolidado e lista de dívidas bilaterais entre moradores.
   */
  async fetchSettleUpData(moradiaId: string, currentUserId: string): Promise<SettleUpData> {
    if (!moradiaId || !currentUserId) {
      return { netBalance: 'R$ 0,00', isPositive: true, debts: [] };
    }

    // 1. Buscar todas as despesas da casa
    const { data: despesas, error: despesasError } = await supabase
      .from('despesas')
      .select('id, titulo, pagador_id')
      .eq('moradia_id', moradiaId);

    if (despesasError) {
      throw new Error(despesasError.message || 'Falha ao carregar despesas da moradia.');
    }

    const despesasMap = new Map((despesas || []).map((d) => [d.id, d]));
    const despesasIds = (despesas || []).map((d) => d.id);

    if (despesasIds.length === 0) {
      return { netBalance: 'R$ 0,00', isPositive: true, debts: [] };
    }

    // 2. Buscar rateios pendentes dessas despesas
    const { data: rateios, error: rateiosError } = await supabase
      .from('rateios_despesa')
      .select('*')
      .in('despesa_id', despesasIds)
      .eq('status', 'pendente');

    if (rateiosError) {
      throw new Error(rateiosError.message || 'Falha ao carregar rateios pendentes.');
    }

    // 3. Balanços cruzados: quanto cada morador deve ao usuário logado vs quanto o usuário logado deve
    // balanceWithOthers[otherUserId] > 0 => otherUserId deve a currentUserId
    // balanceWithOthers[otherUserId] < 0 => currentUserId deve a otherUserId
    const balanceWithOthers: Record<string, number> = {};

    (rateios || []).forEach((r: RateioDespesaDB) => {
      const desp = despesasMap.get(r.despesa_id);
      if (!desp) return;

      const pagador = desp.pagador_id;
      const devedor = r.usuario_id;

      if (pagador === currentUserId && devedor !== currentUserId) {
        balanceWithOthers[devedor] = (balanceWithOthers[devedor] || 0) + Number(r.valor_parte);
      } else if (devedor === currentUserId && pagador !== currentUserId) {
        balanceWithOthers[pagador] = (balanceWithOthers[pagador] || 0) - Number(r.valor_parte);
      }
    });

    // 4. Buscar perfis de todas as contrapartes envolvidas (incluindo ex-moradores)
    const counterpartIds = Array.from(new Set(Object.keys(balanceWithOthers)));
    let namesMap: Record<string, string> = {};

    if (counterpartIds.length > 0) {
      const { data: perfis } = await supabase
        .from('perfis')
        .select('id, nome_completo')
        .in('id', counterpartIds);

      (perfis || []).forEach((p: { id: string; nome_completo: string }) => {
        namesMap[p.id] = p.nome_completo;
      });
    }

    let totalLiquido = 0;
    const debtItems: DebtBalanceItem[] = [];

    Object.entries(balanceWithOthers).forEach(([otherId, bal]) => {
      totalLiquido += bal;
      if (Math.abs(bal) < 0.01) return;

      const otherName = namesMap[otherId] || 'Morador';
      const initials =
        otherName
          .split(' ')
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'MO';

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

    const normalizedTotal = Math.abs(totalLiquido) < 0.01 ? 0 : parseFloat(totalLiquido.toFixed(2));
    const isPos = normalizedTotal >= 0;
    const netFormatted = `R$ ${formatMoney(Math.abs(normalizedTotal))}${normalizedTotal < 0 ? ' (Devedor)' : ''}`;

    return {
      netBalance: normalizedTotal === 0 ? 'R$ 0,00' : netFormatted,
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
      .eq('status', 'aguardando_aprovacao')
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Pagamento já processado ou não encontrado.');
    }

    const pagamento = data as PagamentoAcertoDB;

    if (isApproved) {
      // O devedor está pagando o credor. Buscamos despesas pagas pelo credor na moradia
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('id, pagador_id, criado_em')
        .eq('moradia_id', pagamento.moradia_id)
        .eq('pagador_id', pagamento.credor_id);

      if (despesasError) {
        await supabase
          .from('pagamentos_acerto')
          .update({ status: 'aguardando_aprovacao', confirmado_em: null })
          .eq('id', pagamentoId);
        throw new Error(`Falha ao consultar despesas para quitação: ${despesasError.message}`);
      }

      const affected = (despesas || []).map((d) => d.id);
      const expenseDateMap = new Map((despesas || []).map((d) => [d.id, d.criado_em || '']));

      if (affected.length > 0) {
        // Buscar apenas os rateios pendentes onde o devedor deve ao credor e ordenar pelas despesas mais antigas
        const { data: rateiosRaw, error: rateiosError } = await supabase
          .from('rateios_despesa')
          .select('*')
          .in('despesa_id', affected)
          .eq('usuario_id', pagamento.devedor_id)
          .eq('status', 'pendente');

        if (rateiosError) {
          await supabase
            .from('pagamentos_acerto')
            .update({ status: 'aguardando_aprovacao', confirmado_em: null })
            .eq('id', pagamentoId);
          throw new Error(`Falha ao consultar rateios para quitação: ${rateiosError.message}`);
        }

        const rateios = [...((rateiosRaw || []) as RateioDespesaDB[])].sort((a, b) =>
          (expenseDateMap.get(a.despesa_id) || '').localeCompare(expenseDateMap.get(b.despesa_id) || '')
        );

        let remaining = Number(pagamento.valor || 0);
        const toSettle: string[] = [];
        let partialUpdate: { id: string; novoValor: number } | null = null;

        for (const r of rateios) {
          const rValor = Number(r.valor_parte || 0);
          if (remaining >= rValor - 0.01) {
            toSettle.push(r.id);
            remaining = Math.max(0, parseFloat((remaining - rValor).toFixed(2)));
          } else if (remaining >= 0.01) {
            partialUpdate = {
              id: r.id,
              novoValor: Math.max(0.01, parseFloat((rValor - remaining).toFixed(2))),
            };
            remaining = 0;
            break;
          } else {
            break;
          }
        }

        if (toSettle.length > 0) {
          const { error: updateRateiosError } = await supabase
            .from('rateios_despesa')
            .update({ status: 'pago', pago_em: new Date().toISOString() })
            .in('id', toSettle);

          if (updateRateiosError) {
            await supabase
              .from('pagamentos_acerto')
              .update({ status: 'aguardando_aprovacao', confirmado_em: null })
              .eq('id', pagamentoId);
            throw new Error(`Falha ao quitar rateios: ${updateRateiosError.message}`);
          }
        }

        if (partialUpdate) {
          const { error: partialError } = await supabase
            .from('rateios_despesa')
            .update({ valor_parte: partialUpdate.novoValor })
            .eq('id', partialUpdate.id);

          if (partialError) {
            throw new Error(`Falha ao abater pagamento parcial no rateio: ${partialError.message}`);
          }
        }

        // Atualiza status das despesas afetadas para 'pago' ou 'parcial'
        const { data: allSplits, error: splitsStatusError } = await supabase
          .from('rateios_despesa')
          .select('despesa_id, status')
          .in('despesa_id', affected);

        if (!splitsStatusError && allSplits) {
          const byExpense = new Map<string, { paid: number; pending: number }>();
          for (const row of allSplits as { despesa_id: string; status: string }[]) {
            const entry = byExpense.get(row.despesa_id) || { paid: 0, pending: 0 };
            if (row.status === 'pago') entry.paid += 1;
            else entry.pending += 1;
            byExpense.set(row.despesa_id, entry);
          }

          const settledIds: string[] = [];
          const partialIds: string[] = [];
          for (const expId of affected) {
            const counts = byExpense.get(expId);
            if (!counts || counts.pending === 0) settledIds.push(expId);
            else if (counts.paid > 0 && counts.pending > 0) partialIds.push(expId);
          }

          const nowIso = new Date().toISOString();
          if (settledIds.length > 0) {
            await supabase
              .from('despesas')
              .update({ status: 'pago', atualizado_em: nowIso })
              .in('id', settledIds);
          }
          if (partialIds.length > 0) {
            await supabase
              .from('despesas')
              .update({ status: 'parcial', atualizado_em: nowIso })
              .in('id', partialIds);
          }
        }
      }
    }

    return pagamento;
  },

  /**
   * Lista os pagamentos informados por outros moradores aguardando a confirmação do usuário (credor).
   *
   * @param moradiaId UUID da moradia.
   * @param creditorId UUID do morador credor que deve aprovar ou recusar os pagamentos.
   * @returns Lista de comprovantes pendentes de validação pelo credor.
   */
  async fetchPendingPayments(moradiaId: string, creditorId: string): Promise<PendingPaymentItem[]> {
    if (!moradiaId || !creditorId) return [];
    const { data, error } = await supabase
      .from('pagamentos_acerto')
      .select('*')
      .eq('moradia_id', moradiaId)
      .eq('credor_id', creditorId)
      .eq('status', 'aguardando_aprovacao')
      .order('criado_em', { ascending: false });
    if (error || !data) return [];

    const ids = Array.from(new Set((data as PagamentoAcertoDB[]).map((p) => p.devedor_id)));
    const names: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: perfis } = await supabase.from('perfis').select('id, nome_completo').in('id', ids);
      (perfis || []).forEach((p: { id: string; nome_completo: string }) => {
        names[p.id] = p.nome_completo;
      });
    }

    return (data as PagamentoAcertoDB[]).map((p) => {
      const name = names[p.devedor_id] || 'Morador';
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      const created = p.criado_em ? new Date(p.criado_em) : null;
      const validCreated = created && !Number.isNaN(created.getTime()) ? created : null;
      return {
        id: p.id,
        payerId: p.devedor_id,
        payerName: name,
        payerInitials: initials,
        paymentMethod: p.metodo_pagamento === 'pix' ? 'Transferência via Pix' : p.metodo_pagamento,
        amount: `R$ ${formatMoney(p.valor)}`,
        reference: 'Acerto de contas da moradia',
        dateTime: validCreated ? validCreated.toLocaleString('pt-BR') : '',
        receiptUrl: p.comprovante_url || null,
      };
    });
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

