import { supabase } from './supabase';
import { SendNudgeInput } from '../types/database';
import { ResidentRankingItem } from '../screens/ranking/RankingScreen';

/**
 * Extrai as duas primeiras letras iniciais de um nome para exibição em avatares.
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'MO';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Serviço responsável pela consolidação do ranking semanal/geral de moradores
 * e envio de cutucadas interativas entre os participantes.
 */
export const rankingService = {
  /**
   * Consulta os moradores aprovados da moradia, computa tarefas concluídas e pendentes
   * no banco de dados e ordena a classificação por pontos de experiência (XP).
   *
   * @param moradiaId UUID da moradia.
   * @param currentUserId UUID do usuário autenticado para identificação de 'Você'.
   * @returns Lista ordenada de participantes do ranking.
   */
  async fetchRanking(
    moradiaId: string,
    currentUserId?: string
  ): Promise<ResidentRankingItem[]> {
    try {
      if (!moradiaId) return [];

      // 1. Busca os membros aprovados na moradia
      const { data: membros, error: membError } = await supabase
        .from('membros_moradia')
        .select('id, usuario_id, papel, status, nivel, xp, moedas, entrou_em')
        .eq('moradia_id', moradiaId)
        .eq('status', 'aprovado');

      if (membError || !membros) {
        console.warn('rankingService.fetchRanking: Erro ao listar membros:', membError?.message);
        return [];
      }

      // 2. Busca nomes e perfis dos membros
      const userIds = membros.map((m) => m.usuario_id);
      const { data: perfis } = await supabase
        .from('perfis')
        .select('id, nome_completo, email')
        .in('id', userIds);

      const perfilMap = new Map<string, { nome_completo: string; email: string }>();
      (perfis || []).forEach((p) => {
        perfilMap.set(p.id, p);
      });

      // 3. Busca tarefas da moradia para contabilizar conclusões e pendências reais
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select('id, responsavel_id, status')
        .eq('moradia_id', moradiaId);

      const tarefasList = tarefas || [];

      // 4. Mapeia cada morador com contadores reais
      const mapped = membros.map((m) => {
        const perfil = perfilMap.get(m.usuario_id);
        const nome = perfil?.nome_completo || 'Morador';

        // Tarefas concluídas por este morador
        const completedCount = tarefasList.filter(
          (t) =>
            t.responsavel_id === m.usuario_id &&
            (t.status === 'concluida' || t.status === 'Concluída')
        ).length;

        // Tarefas pendentes aguardando este morador
        const pendingCount = tarefasList.filter(
          (t) =>
            t.responsavel_id === m.usuario_id &&
            (t.status === 'pendente' || t.status === 'Pendente')
        ).length;

        return {
          id: m.id,
          userId: m.usuario_id,
          name: nome,
          initials: getInitials(nome),
          isCurrentUser: m.usuario_id === currentUserId,
          tasksCompleted: completedCount,
          coins: m.moedas || 0,
          xp: m.xp || 0,
          level: m.nivel || Math.max(1, Math.floor((m.xp || 0) / 100) + 1),
          pendingTasksCount: pendingCount,
          highlightNudge: pendingCount > 0,
        };
      });

      // 5. Ordena por XP decrescente (desempate por tarefas concluídas)
      mapped.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.tasksCompleted - a.tasksCompleted;
      });

      // 6. Atribui a posição no ranking (1º, 2º, ...)
      return mapped.map((item, index) => ({
        id: item.id,
        userId: item.userId,
        rank: index + 1,
        name: item.name,
        initials: item.initials,
        isCurrentUser: item.isCurrentUser,
        tasksCompleted: item.tasksCompleted,
        coins: item.coins,
        xp: item.xp,
        level: item.level,
        pendingTasksCount: item.pendingTasksCount,
        highlightNudge: item.highlightNudge,
      }));
    } catch (err) {
      console.warn('rankingService.fetchRanking: exceção capturada:', err);
      return [];
    }
  },

  /**
   * Envia uma cutucada (nudge) amigável a um morador com pendências, registrando
   * um alerta em 'notificacoes' no Supabase.
   *
   * @param input Dados do remetente, destinatário e moradia.
   * @returns Verdadeiro se a cutucada foi persistida com sucesso.
   */
  async sendNudge(input: SendNudgeInput): Promise<boolean> {
    try {
      const { targetUserId, targetName, senderUserId, senderName, moradiaId } = input;

      if (!targetUserId || !moradiaId) {
        throw new Error('Parâmetros de cutucada inválidos.');
      }

      let { error } = await supabase.from('notificacoes').insert({
        moradia_id: moradiaId,
        destinatario_id: targetUserId,
        remetente_id: senderUserId || null,
        tipo: 'Cutucada',
        filtro_categoria: 'Cutucadas',
        titulo: 'Cutucada de Tarefas!',
        descricao: `${senderName || 'Um morador'} te cutucou no ranking! Você tem tarefas pendentes na residência.`,
        texto_acao: 'Ver tarefas',
        tipo_acao: 'primaria',
        metadados_extras: 'Ranking da casa',
        lida: false,
      });

      if (error && error.code === '42703') {
        const retry = await supabase.from('notificacoes').insert({
          moradia_id: moradiaId,
          usuario_id: targetUserId,
          remetente_id: senderUserId || null,
          tipo: 'Cutucada',
          category_filter: 'Cutucadas',
          titulo: 'Cutucada de Tarefas!',
          descricao: `${senderName || 'Um morador'} te cutucou no ranking! Você tem tarefas pendentes na residência.`,
          action_text: 'Ver tarefas',
          extra_meta: 'Ranking da casa',
          has_coin_icon: false,
          lida: false,
        });
        error = retry.error;
      }

      if (error) {
        console.error('rankingService.sendNudge erro:', error.message, error.details);
        throw new Error(error.message || 'Falha ao registrar a cutucada no banco.');
      }

      return true;
    } catch (err) {
      console.error('rankingService.sendNudge exceção:', err);
      throw err;
    }
  },
};

