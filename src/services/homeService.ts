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
   * @returns {Promise<{ dashboardData: HomeDashboardData; todayTasks: TaskItem[] }>}
   */
  async getDashboardData(
    currentProfile?: Perfil | null,
    houseId?: string
  ): Promise<{ dashboardData: HomeDashboardData; todayTasks: TaskItem[] }> {
    const defaultData: HomeDashboardData = {
      userName: currentProfile?.nome_completo || 'Norman Osborn',
      userInitials: currentProfile?.nome_completo
        ? currentProfile.nome_completo
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'NO',
      userLevel: 4,
      houseName: 'República do Sexteto Sinistro',
      balanceAmount: '85,50',
      balanceStatus: 'Você tem a receber',
      debtorText: 'Doutor Octopus te deve:',
      debtorAmount: 'R$ 85,50',
      leaderName: currentProfile?.nome_completo || 'Norman Osborn',
      leaderXp: 340,
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
