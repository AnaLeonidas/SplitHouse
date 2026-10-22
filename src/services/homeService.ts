import { supabase } from './supabase';
import { HomeDashboardData, Perfil } from '../types/database';
import { tasksService } from './tasksService';
import { TaskItem } from '../screens/tasks/TasksListScreen';

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
   * @returns {Promise<{ dashboardData: HomeDashboardData; todayTasks: TaskItem[] }>}
   */
  async getDashboardData(
    currentProfile?: Perfil | null,
    houseId?: string,
    houseName?: string
  ): Promise<{ dashboardData: HomeDashboardData; todayTasks: TaskItem[] }> {
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

    const defaultData: HomeDashboardData = {
      userName: nome,
      userInitials: initials,
      userLevel: 1,
      houseName: houseName || 'Sua Moradia',
      balanceAmount: '0,00',
      balanceStatus: 'Tudo em dia',
      debtorText: undefined,
      debtorAmount: undefined,
      leaderName: nome,
      leaderXp: 0,
    };

    try {
      const allTasks = await tasksService.fetchTasks(houseId);

      const todayTasks = allTasks.filter((t) => {
        const prazo = t.deadline.toLowerCase();
        return (
          t.status !== 'Concluída' &&
          (prazo.includes('hoje') || prazo.includes('amanhã') || prazo.includes('14:00') || prazo.includes('19:00'))
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

