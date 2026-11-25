import { supabase } from './supabase';
import { HomeDashboardData, Perfil } from '../types/database';
import { tasksService } from './tasksService';
import { financeService } from './financeService';
import { rankingService } from './rankingService';
import { TaskItem } from '../screens/tasks/TasksListScreen';

/**
 * Dados consolidados retornados pelo serviço da tela inicial (Home).
 */
export interface HomeDashboardResult {
  /** Resumo financeiro, métricas e destaques do morador na casa */
  dashboardData: HomeDashboardData;
  /** Lista priorizada das próximas tarefas pendentes para hoje */
  todayTasks: TaskItem[];
}

/**
 * Serviço responsável por agregar e carregar os dados consolidados do painel principal (Home Dashboard).
 */
export const homeService = {
  /**
   * Obtém os dados consolidados para exibição na tela Home.
   *
   * @param currentProfile Perfil do morador logado atualmente (opcional).
   * @param houseId Identificador da moradia vinculada (opcional).
   * @param houseName Nome da república vinculada (opcional).
   * @returns Resumo consolidado do painel e tarefas pendentes prioritárias.
   */
  async getDashboardData(
    currentProfile?: Perfil | null,
    houseId?: string,
    houseName?: string
  ): Promise<HomeDashboardResult> {
    const nome = currentProfile?.nome_completo || 'Morador';
    const initials = currentProfile?.nome_completo
      ? currentProfile.nome_completo
          .split(' ')
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'SH';

    let balanceAmount = '0,00';
    let balanceStatus = 'Tudo em dia';
    let debtorText: string | undefined = undefined;
    let debtorAmount: string | undefined = undefined;

    // Calcular balanço financeiro real da moradia se houver vínculo
    if (houseId && currentProfile?.id) {
      try {
        const settleData = await financeService.fetchSettleUpData(houseId, currentProfile.id);
        balanceAmount = settleData.netBalance.replace('R$ ', '').replace(' (Devedor)', '');
        balanceStatus = settleData.isPositive
          ? (settleData.netBalance === 'R$ 0,00' ? 'Tudo em dia' : 'A receber')
          : 'A pagar';

        if (settleData.debts && settleData.debts.length > 0) {
          const firstDebt = settleData.debts[0];
          debtorText = `${firstDebt.debtorName}: ${firstDebt.debtorStatus.toLowerCase()}`;
          debtorAmount = firstDebt.debtAmount;
        }
      } catch {
        // Fallback para valor zerado
      }
    }

    let userLevel = 1;
    let leaderName = nome;
    let leaderXp = 0;

    if (houseId) {
      try {
        const ranking = await rankingService.fetchRanking(houseId, currentProfile?.id);
        if (ranking.length > 0) {
          leaderName = ranking[0].name;
          leaderXp = ranking[0].xp;
          const me = ranking.find((r) => r.userId === currentProfile?.id);
          if (me) userLevel = me.level;
        }
      } catch {
        // Fallback para valores padrão caso o ranking não carregue
      }
    }

    const defaultData: HomeDashboardData = {
      userName: nome,
      userInitials: initials,
      userLevel,
      houseName: houseName || 'Sua Moradia',
      balanceAmount,
      balanceStatus,
      debtorText,
      debtorAmount,
      leaderName,
      leaderXp,
    };

    try {
      const allTasks = await tasksService.fetchTasks(houseId, currentProfile?.id);

      const todayTasks = allTasks.filter((t) => {
        const prazo = (t.deadline || '').toLowerCase();
        return (
          t.assignee === 'Você' &&
          t.status !== 'Concluída' &&
          prazo.includes('hoje') &&
          !prazo.includes('amanhã')
        );
      });

      return {
        dashboardData: defaultData,
        todayTasks: todayTasks.slice(0, 3),
      };
    } catch {
      return {
        dashboardData: defaultData,
        todayTasks: [],
      };
    }
  },
};
