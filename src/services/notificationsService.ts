import { supabase } from './supabase';
import { NotificacaoDB } from '../types/database';
import { NotificationItem } from '../screens/notifications/NotificationsScreen';

/**
 * Converte timestamp ISO para tempo transcorrido legível (ex.: "Há 5 min", "Há 2 horas", "Hoje às 14:00").
 */
export function formatTimeAgo(isoString?: string | null): string {
  if (!isoString) return 'Agora';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  } catch {
    return 'Recente';
  }
}

/**
 * Converte registro de banco para a interface visual de notificações.
 */
export function mapRowToNotificationItem(row: NotificacaoDB): NotificationItem {
  let mappedCategory: 'Validações' | 'Finanças' | 'Cutucadas' = 'Cutucadas';
  if (row.category_filter === 'Validações' || row.tipo === 'Validação') {
    mappedCategory = 'Validações';
  } else if (
    (row as any).category_filter === 'Finanças' ||
    (row as any).filtro_categoria === 'Finanças' ||
    row.tipo === 'Recompensa'
  ) {
    mappedCategory = 'Finanças';
  } else {
    mappedCategory = 'Cutucadas';
  }

  let mappedType: 'Validação' | 'Cutucada' | 'Vencimento' | 'Concluída' = 'Cutucada';
  if (row.tipo === 'Validação') mappedType = 'Validação';
  else if (row.tipo === 'Vencimento') mappedType = 'Vencimento';
  else if (row.tipo === 'Concluída') mappedType = 'Concluída';

  const actionText =
    (row as any).action_text ||
    (row as any).texto_acao ||
    (mappedCategory === 'Validações' ? 'Validar agora' : undefined);

  return {
    id: row.id,
    type: mappedType,
    categoryFilter: mappedCategory,
    isRead: row.lida,
    timeAgo: formatTimeAgo(row.criado_em),
    title: row.titulo,
    description: row.descricao,
    actionText,
    actionType: mappedCategory === 'Validações' ? 'primary' : 'secondary',
    extraMeta: (row as any).extra_meta || (row as any).metadados_extras || undefined,
    hasCoinIcon: Boolean((row as any).has_coin_icon),
  };
}

/**
 * Normaliza o filtro de categoria para satisfazer a restrição CHECK do banco.
 */
function normalizeFiltroCategoria(cat?: string): 'Cutucadas' | 'Validacoes' | 'Financas' {
  if (cat === 'Validações' || cat === 'Validacoes') return 'Validacoes';
  if (cat === 'Finanças' || cat === 'Financas') return 'Financas';
  return 'Cutucadas';
}

/**
 * Normaliza o tipo de notificação para satisfazer a restrição CHECK do banco.
 */
function normalizeTipoNotificacao(tipo?: string): 'Cutucada' | 'Vencimento' | 'Validacao' | 'Concluida' {
  if (tipo === 'Validação' || tipo === 'Validacao') return 'Validacao';
  if (tipo === 'Concluída' || tipo === 'Concluida') return 'Concluida';
  if (tipo === 'Vencimento') return 'Vencimento';
  return 'Cutucada';
}

/**
 * Serviço responsável pelo gerenciamento de notificações no Supabase.
 */
export const notificationsService = {
  /**
   * Busca notificações do usuário logado ordenadas cronologicamente.
   */
  async fetchNotifications(userId: string, moradiaId?: string): Promise<NotificationItem[]> {
    try {
      if (!userId) return [];

      // Consulta por destinatario_id (esquema do banco existente) ou usuario_id (fallback)
      let { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('destinatario_id', userId)
        .order('criado_em', { ascending: false });

      if (error && error.code === '42703') {
        const retry = await supabase
          .from('notificacoes')
          .select('*')
          .eq('usuario_id', userId)
          .order('criado_em', { ascending: false });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('notificationsService.fetchNotifications erro:', error.message, error.details);
        return [];
      }
      if (!data) {
        return [];
      }

      // Se moradiaId estiver especificado, filtra em memória preservando notificações globais ou da moradia
      const filtered = moradiaId
        ? (data as any[]).filter((n) => !n.moradia_id || n.moradia_id === moradiaId)
        : (data as any[]);

      return filtered.map(mapRowToNotificationItem);
    } catch (err) {
      console.error('notificationsService.fetchNotifications exceção:', err);
      return [];
    }
  },

  /**
   * Marca uma notificação como lida.
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Remove todas as notificações já lidas do usuário.
   */
  async clearReadNotifications(userId: string): Promise<boolean> {
    try {
      let { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('destinatario_id', userId)
        .eq('lida', true);

      if (error && error.code === '42703') {
        const retry = await supabase
          .from('notificacoes')
          .delete()
          .eq('usuario_id', userId)
          .eq('lida', true);
        error = retry.error;
      }
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Cria notificações para um ou mais destinatários (cada morador recebe a sua).
   */
  async notifyUsers(
    recipientIds: string[],
    payload: {
      moradiaId: string;
      senderId?: string;
      tipo: NotificacaoDB['tipo'];
      categoryFilter: NotificacaoDB['category_filter'];
      titulo: string;
      descricao: string;
      actionText?: string;
      extraMeta?: string;
      hasCoinIcon?: boolean;
    }
  ): Promise<boolean> {
    try {
      const uniqueRecipients = Array.from(new Set(recipientIds)).filter(
        (id) => id && id !== payload.senderId
      );
      if (uniqueRecipients.length === 0) return true;

      const rowsCompat = uniqueRecipients.map((destinatario_id) => ({
        moradia_id: payload.moradiaId,
        destinatario_id,
        remetente_id: payload.senderId || null,
        tipo: normalizeTipoNotificacao(payload.tipo),
        filtro_categoria: normalizeFiltroCategoria(payload.categoryFilter),
        titulo: payload.titulo,
        descricao: payload.descricao,
        texto_acao: payload.actionText || null,
        tipo_acao: payload.actionText ? 'primaria' : 'secundaria',
        metadados_extras: payload.extraMeta || null,
        lida: false,
      }));

      let { error } = await supabase.from('notificacoes').insert(rowsCompat);

      if (error && (error.code === '42703' || error.code === '23514')) {
        const rowsAlt = uniqueRecipients.map((usuario_id) => ({
          moradia_id: payload.moradiaId,
          usuario_id,
          remetente_id: payload.senderId || null,
          tipo: payload.tipo,
          category_filter: payload.categoryFilter,
          titulo: payload.titulo,
          descricao: payload.descricao,
          action_text: payload.actionText || null,
          extra_meta: payload.extraMeta || null,
          has_coin_icon: payload.hasCoinIcon || false,
          lida: false,
        }));
        const retry = await supabase.from('notificacoes').insert(rowsAlt);
        error = retry.error;
      }

      if (error) console.warn('notificationsService.notifyUsers:', error.message);
      return !error;
    } catch {
      return false;
    }
  },
};


