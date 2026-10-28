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
  } else if (row.category_filter === 'Finanças' || row.tipo === 'Recompensa') {
    mappedCategory = 'Finanças';
  } else {
    mappedCategory = 'Cutucadas';
  }

  let mappedType: 'Validação' | 'Cutucada' | 'Vencimento' | 'Concluída' = 'Cutucada';
  if (row.tipo === 'Validação') mappedType = 'Validação';
  else if (row.tipo === 'Vencimento') mappedType = 'Vencimento';
  else if (row.tipo === 'Concluída') mappedType = 'Concluída';

  return {
    id: row.id,
    type: mappedType,
    categoryFilter: mappedCategory,
    isRead: row.lida,
    timeAgo: formatTimeAgo(row.criado_em),
    title: row.titulo,
    description: row.descricao,
    actionText: row.action_text || (mappedCategory === 'Validações' ? 'Validar agora' : undefined),
    actionType: mappedCategory === 'Validações' ? 'primary' : 'secondary',
    extraMeta: row.extra_meta || undefined,
    hasCoinIcon: row.has_coin_icon || false,
  };
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

      let query = supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', userId)
        .order('criado_em', { ascending: false });

      if (moradiaId) {
        query = query.or(`moradia_id.eq.${moradiaId},moradia_id.is.null`);
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }

      return (data as NotificacaoDB[]).map(mapRowToNotificationItem);
    } catch {
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
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('usuario_id', userId)
        .eq('lida', true);
      return !error;
    } catch {
      return false;
    }
  },
};

