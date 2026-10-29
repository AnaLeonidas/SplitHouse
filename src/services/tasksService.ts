import { supabase } from './supabase';
import { TarefaDB, ValidacaoTarefaDB } from '../types/database';
import { TaskItem } from '../screens/tasks/TasksListScreen';
import { TaskFormData } from '../screens/tasks/NewTaskScreen';
import { Colors } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { uploadImage } from './storageService';

/**
 * Converte strings amigáveis de prazo (ex.: "Hoje, 22:00", "Amanhã, 10:00", "Em 2 dias")
 * em uma string ISO 8601 compatível com colunas TIMESTAMPTZ do PostgreSQL.
 */
function parseDeadlineToISO(deadlineStr: string): string {
  if (!deadlineStr || !deadlineStr.trim()) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  const trimmed = deadlineStr.trim().toLowerCase();

  // Se já for uma string ISO ou formato data válida
  const directParse = Date.parse(deadlineStr);
  if (!isNaN(directParse) && (deadlineStr.includes('-') || deadlineStr.includes('T'))) {
    return new Date(directParse).toISOString();
  }

  const now = new Date();

  // Padrão "hoje, hh:mm" ou "hoje às hh:mm"
  if (trimmed.startsWith('hoje')) {
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
      return target.toISOString();
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0).toISOString();
  }

  // Padrão "amanhã, hh:mm" ou "amanhã às hh:mm"
  if (trimmed.startsWith('amanhã') || trimmed.startsWith('amanha')) {
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 18;
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0);
    return target.toISOString();
  }

  // Padrão "em X dias"
  const daysMatch = trimmed.match(/em\s+(\d+)\s+dias?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return target.toISOString();
  }

  // Fallback: 24h a partir de agora
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Converte timestamp ISO do banco para rótulo legível em português.
 */
function formatPrazoLimite(isoString?: string | null): string {
  if (!isoString) return 'Hoje, 22:00';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    if (isToday) return `Hoje, ${hh}:${mm}`;
    if (isTomorrow) return `Amanhã, ${hh}:${mm}`;

    const dd = String(date.getDate()).padStart(2, '0');
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mo}, ${hh}:${mm}`;
  } catch {
    return isoString;
  }
}

/**
 * Converte um registro bruto da tabela 'tarefas' do Supabase para a estrutura de dados visual TaskItem.
 *
 * @param row Registro vindo do Supabase.
 * @param currentUserId UUID do usuário logado para rotular 'Você'.
 * @returns {TaskItem} Objeto formatado com ícones e estilos visuais.
 */
function mapRowToTaskItem(row: TarefaDB, currentUserId?: string): TaskItem {
  let icon: keyof typeof Feather.glyphMap = 'check-circle';
  let iconBg = 'rgba(94, 43, 151, 0.1)';
  let iconColor: string = Colors.primary;

  const comodo = (row.comodo || '').toLowerCase();
  if (comodo.includes('cozinha')) {
    icon = 'home';
  } else if (comodo.includes('lixo') || comodo.includes('externa')) {
    icon = 'trash-2';
  } else if (comodo.includes('mercado') || comodo.includes('compras')) {
    icon = 'shopping-bag';
  } else if (comodo.includes('quarto') || comodo.includes('geladeira')) {
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

  let visualStatus: 'Pendente' | 'Concluída' | 'Aguardando validação' = 'Pendente';
  if (row.status === 'em_validacao') {
    visualStatus = 'Aguardando validação';
  } else if (row.status === 'concluida') {
    visualStatus = 'Concluída';
  }

  const isUserResponsible = !!currentUserId && row.responsavel_id === currentUserId;
  const rawName = row.responsavel?.nome_completo || 'Morador';
  const assigneeDisplay = isUserResponsible ? 'Você' : rawName;

  return {
    id: row.id,
    title: row.titulo,
    type: row.tipo,
    location: row.comodo,
    deadline: formatPrazoLimite(row.prazo_limite),
    xp: row.recompensa_xp,
    points: row.recompensa_moedas,
    assigneeId: row.responsavel_id,
    assignee: assigneeDisplay,
    status: visualStatus,
    icon,
    iconBg,
    iconColor,
    requiresValidation: row.status === 'em_validacao',
    executorInfo:
      row.status === 'em_validacao'
        ? `Executada por ${assigneeDisplay === 'Você' ? 'você' : rawName} com foto`
        : undefined,
  };
}

/**
 * Serviço responsável por operações de persistência e consulta de tarefas no Supabase.
 */
export const tasksService = {
  /**
   * Consulta a lista de tarefas da moradia no Supabase.
   *
   * @param moradiaId Identificador da moradia.
   * @param currentUserId UUID do usuário logado.
   * @returns {Promise<TaskItem[]>} Lista de tarefas para exibição.
   */
  async fetchTasks(moradiaId?: string, currentUserId?: string): Promise<TaskItem[]> {
    try {
      if (!moradiaId) {
        return [];
      }

      const { data, error } = await supabase
        .from('tarefas')
        .select(`
          *,
          responsavel:responsavel_id (
            id,
            nome_completo
          )
        `)
        .eq('moradia_id', moradiaId)
        .order('prazo_limite', { ascending: true });

      if (error || !data) {
        if (error) console.warn('Supabase: Erro ao buscar tarefas:', error.message);
        return [];
      }

      return (data as TarefaDB[]).map((row) => mapRowToTaskItem(row, currentUserId));
    } catch (err) {
      console.warn('Supabase: Exceção ao consultar tarefas:', err);
      return [];
    }
  },

  /**
   * Registra uma nova tarefa na tabela 'tarefas' do Supabase.
   *
   * @param formData Dados preenchidos no formulário de criação.
   * @param userId UUID do usuário criador.
   * @param moradiaId UUID da moradia vinculada.
   * @returns {Promise<TaskItem>} Tarefa criada e formatada.
   */
  async createTask(
    formData: TaskFormData,
    userId?: string,
    moradiaId?: string
  ): Promise<TaskItem> {
    if (!moradiaId) {
      throw new Error('Você precisa estar vinculado a uma moradia para criar tarefas.');
    }

    const targetResponsavelId = formData.assigneeId || userId;
    if (!targetResponsavelId) {
      throw new Error('Selecione um morador responsável pela tarefa.');
    }

    const payload = {
      moradia_id: moradiaId,
      titulo: formData.title,
      descricao: formData.location ? `Cômodo: ${formData.location}` : null,
      comodo: formData.location || 'Geral',
      tipo: formData.type,
      responsavel_id: targetResponsavelId,
      prazo_limite: parseDeadlineToISO(formData.deadline),
      recompensa_xp: formData.xp ?? 25,
      recompensa_moedas: formData.points ?? 10,
      requer_validacao: true,
      status: 'pendente' as const,
      criado_por: userId || targetResponsavelId,
    };

    const { data, error } = await supabase
      .from('tarefas')
      .insert(payload)
      .select(`
        *,
        responsavel:responsavel_id (
          id,
          nome_completo
        )
      `)
      .single();

    if (error || !data) {
      console.error('Supabase: Erro ao salvar tarefa:', error);
      throw new Error(error?.message || 'Falha ao salvar tarefa no banco.');
    }

    return mapRowToTaskItem(data as TarefaDB, userId);
  },

  /**
   * Envia uma tarefa para validação comunitária anexando a foto real tirada pelo executor.
   *
   * @param taskId Identificador da tarefa.
   * @param photoUri URI local da foto capturada (será enviada ao Storage).
   * @param executorId UUID do usuário executor.
   * @returns URL pública da foto enviada.
   * @throws Error se o upload ou a gravação falharem.
   */
  async submitTaskValidation(
    taskId: string,
    photoUri: string,
    executorId: string
  ): Promise<string> {
    const photoUrl = await uploadImage(photoUri, 'tarefas');

    const { error: valError } = await supabase.from('validacoes_tarefa').insert({
      tarefa_id: taskId,
      executor_id: executorId,
      foto_comprovante_url: photoUrl,
      status: 'pendente',
    });
    if (valError) {
      throw new Error(`Falha ao registrar a validação: ${valError.message}`);
    }

    const { error } = await supabase
      .from('tarefas')
      .update({
        status: 'em_validacao',
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', taskId);
    if (error) {
      throw new Error(`Falha ao atualizar a tarefa: ${error.message}`);
    }

    return photoUrl;
  },

  /**
   * Busca a foto e os dados do envio pendente de validação de uma tarefa.
   */
  async getPendingValidation(
    taskId: string
  ): Promise<{ photoUrl: string | null; executorId: string | null; sentAt: string | null } | null> {
    try {
      const { data, error } = await supabase
        .from('validacoes_tarefa')
        .select('*')
        .eq('tarefa_id', taskId)
        .eq('status', 'pendente');
      if (error || !data || data.length === 0) return null;
      const rows = [...data].sort((a: any, b: any) =>
        String(b.criado_em || b.created_at || '').localeCompare(String(a.criado_em || a.created_at || ''))
      );
      const row: any = rows[0];
      return {
        photoUrl: row.foto_comprovante_url || null,
        executorId: row.executor_id || null,
        sentAt: row.criado_em || row.created_at || null,
      };
    } catch {
      return null;
    }
  },

  /**
   * Valida ou rejeita uma tarefa submetida por outro morador.
   * Registra a auditoria na tabela 'validacoes_tarefa' e atualiza o estado em 'tarefas'.
   * Se aprovada, bonifica o executor com XP e Moedas.
   *
   * @param taskId Identificador da tarefa auditada.
   * @param validatorId UUID do morador avaliador.
   * @param approved Se a tarefa foi aprovada ou recusada.
   * @param justification Justificativa (obrigatória em recusas).
   * @returns {Promise<boolean>} Sucesso da validação.
   */
  async validateTask(
    taskId: string,
    validatorId: string,
    approved: boolean,
    justification?: string
  ): Promise<boolean> {
    try {
      // 1. Atualiza o envio pendente na tabela validacoes_tarefa
      await supabase
        .from('validacoes_tarefa')
        .update({
          validador_id: validatorId,
          status: approved ? 'aprovada' : 'recusada',
          justificativa: justification || null,
          validado_em: new Date().toISOString(),
        })
        .eq('tarefa_id', taskId)
        .eq('status', 'pendente');

      // 2. Atualiza estado em tarefas
      const newStatus = approved ? 'concluida' : 'pendente';
      const { data: updatedTask, error } = await supabase
        .from('tarefas')
        .update({
          status: newStatus,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select('moradia_id, responsavel_id, recompensa_xp, recompensa_moedas')
        .single();

      if (error) {
        console.error('Supabase: Erro ao validar tarefa:', error.message);
        return false;
      }

      // 3. Se aprovada, credita XP e Moedas ao membro
      if (approved && updatedTask) {
        const { data: membro } = await supabase
          .from('membros_moradia')
          .select('id, xp, moedas')
          .eq('moradia_id', updatedTask.moradia_id)
          .eq('usuario_id', updatedTask.responsavel_id)
          .single();

        if (membro) {
          await supabase
            .from('membros_moradia')
            .update({
              xp: (membro.xp || 0) + (updatedTask.recompensa_xp || 0),
              moedas: (membro.moedas || 0) + (updatedTask.recompensa_moedas || 0),
            })
            .eq('id', membro.id);
        }
      }

      return true;
    } catch (err) {
      console.warn('Supabase: Exceção ao validar tarefa:', err);
      return false;
    }
  },
};
