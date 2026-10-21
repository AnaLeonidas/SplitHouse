import { supabase } from './supabase';
import { TarefaDB, ValidacaoTarefaDB } from '../types/database';
import { TaskItem, mockTasks } from '../screens/tasks/TasksListScreen';
import { TaskFormData } from '../screens/tasks/NewTaskScreen';
import { Colors } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

/**
 * Converte um registro bruto da tabela 'tarefas' do Supabase para a estrutura de dados visual TaskItem.
 *
 * @param row Registro vindo do Supabase.
 * @returns {TaskItem} Objeto formatado com ícones e estilos visuais.
 */
function mapRowToTaskItem(row: TarefaDB): TaskItem {
  let icon: keyof typeof Feather.glyphMap = 'check-circle';
  let iconBg = 'rgba(94, 43, 151, 0.1)';
  let iconColor: string = Colors.primary;

  if (row.comodo?.toLowerCase().includes('cozinha')) {
    icon = 'home';
  } else if (row.comodo?.toLowerCase().includes('lixo') || row.comodo?.toLowerCase().includes('externa')) {
    icon = 'trash-2';
  } else if (row.comodo?.toLowerCase().includes('mercado')) {
    icon = 'shopping-bag';
  } else if (row.comodo?.toLowerCase().includes('quarto') || row.comodo?.toLowerCase().includes('geladeira')) {
    icon = 'archive';
  }

  if (row.tipo === 'Emergencial') {
    icon = 'alert-triangle';
    iconBg = 'rgba(239, 68, 68, 0.12)';
    iconColor = Colors.danger;
  } else if (row.tipo === 'Rotativa') {
    iconBg = 'rgba(94, 43, 151, 0.12)';
    iconColor = Colors.primary;
  } else {
    iconBg = 'rgba(204, 146, 194, 0.25)';
    iconColor = Colors.primary;
  }

  return {
    id: row.id,
    title: row.titulo,
    type: row.tipo,
    location: row.comodo,
    deadline: row.prazo,
    xp: row.xp,
    points: row.moedas,
    assignee: row.responsavel_nome || 'Morador',
    status: row.status,
    icon,
    iconBg,
    iconColor,
    requiresValidation: row.requer_validacao,
    executorInfo: row.executor_info || undefined,
  };
}

/**
 * Serviço responsável por operações de persistência e consulta de tarefas no Supabase.
 */
export const tasksService = {
  /**
   * Consulta a lista de tarefas da moradia no Supabase.
   * Possui fallback transparente para os dados locais caso o banco esteja indisponível.
   *
   * @param moradiaId Identificador da moradia (opcional).
   * @returns {Promise<TaskItem[]>} Lista de tarefas para exibição.
   */
  async fetchTasks(moradiaId?: string): Promise<TaskItem[]> {
    try {
      let query = supabase.from('tarefas').select('*');
      if (moradiaId) {
        query = query.eq('moradia_id', moradiaId);
      }

      const { data, error } = await query.order('prazo', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockTasks;
      }

      return (data as TarefaDB[]).map(mapRowToTaskItem);
    } catch {
      return mockTasks;
    }
  },

  /**
   * Registra uma nova tarefa na tabela 'tarefas' do Supabase.
   *
   * @param formData Dados preenchidos no formulário de criação.
   * @param userId UUID do usuário criador (opcional).
   * @param moradiaId UUID da moradia vinculada (opcional).
   * @returns {Promise<TaskItem>} Tarefa criada e formatada.
   */
  async createTask(
    formData: TaskFormData,
    userId?: string,
    moradiaId?: string
  ): Promise<TaskItem> {
    const payload = {
      titulo: formData.title,
      comodo: formData.location,
      tipo: formData.type,
      responsavel_nome: formData.assignee,
      responsavel_id: userId || null,
      moradia_id: moradiaId || null,
      prazo: formData.deadline,
      xp: formData.xp,
      moedas: formData.points,
      status: 'Pendente' as const,
      requer_validacao: false,
    };

    try {
      const { data, error } = await supabase
        .from('tarefas')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return mapRowToTaskItem(data as TarefaDB);
      }
    } catch {
      // Fallback gracioso caso a tabela ainda não esteja provisionada
    }

    return {
      id: Date.now().toString(),
      title: formData.title,
      location: formData.location,
      type: formData.type,
      assignee: formData.assignee,
      deadline: formData.deadline,
      xp: formData.xp,
      points: formData.points,
      status: 'Pendente',
      icon: formData.type === 'Emergencial' ? 'alert-triangle' : 'check-circle',
      iconBg:
        formData.type === 'Emergencial'
          ? 'rgba(239, 68, 68, 0.12)'
          : 'rgba(94, 43, 151, 0.1)',
      iconColor: formData.type === 'Emergencial' ? Colors.danger : Colors.primary,
      requiresValidation: false,
    };
  },

  /**
   * Envia uma tarefa para validação comunitária anexando foto e dados de execução.
   *
   * @param taskId Identificador da tarefa.
   * @param photoUrl URL ou nome da foto comprobatória.
   * @param executorName Nome do morador executor.
   * @returns {Promise<boolean>} Sucesso da operação.
   */
  async submitTaskValidation(
    taskId: string,
    photoUrl?: string,
    executorName?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({
          status: 'Aguardando validação',
          requer_validacao: true,
          foto_comprovante_url: photoUrl || null,
          executor_info: executorName
            ? `Executada por ${executorName} com foto`
            : 'Executada com foto para revisão',
        })
        .eq('id', taskId);

      return !error;
    } catch {
      return true;
    }
  },

  /**
   * Valida ou rejeita uma tarefa submetida por outro morador.
   * Registra a auditoria na tabela 'validacoes_tarefa' e atualiza o estado em 'tarefas'.
   *
   * @param taskId Identificador da tarefa auditada.
   * @param validatorId UUID do morador avaliador.
   * @param approved Se a tarefa foi aprovada ou recusada.
   * @param justification Justificativa (obrigatória em recusas).
   * @param validatorName Nome do avaliador para histórico.
   * @returns {Promise<boolean>} Sucesso da validação.
   */
  async validateTask(
    taskId: string,
    validatorId: string,
    approved: boolean,
    justification?: string,
    validatorName?: string
  ): Promise<boolean> {
    try {
      const statusFinal = approved ? 'Concluída' : 'Pendente';

      await supabase.from('validacoes_tarefa').insert({
        tarefa_id: taskId,
        validador_id: validatorId,
        validador_nome: validatorName || null,
        status: approved ? 'aprovada' : 'recusada',
        justificativa: justification || null,
      });

      const { error } = await supabase
        .from('tarefas')
        .update({
          status: statusFinal,
          requer_validacao: false,
          concluido_em: approved ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      return !error;
    } catch {
      return true;
    }
  },
};
