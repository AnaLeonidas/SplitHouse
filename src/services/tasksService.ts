import { supabase } from './supabase';
import { TarefaDB, ValidacaoTarefaDB } from '../types/database';
import { TaskItem } from '../screens/tasks/TasksListScreen';
import { TaskFormData } from '../screens/tasks/NewTaskScreen';
import { Colors } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { uploadImage } from './storageService';
import { calculateLevelAndTitle } from '../utils/gamification';

/**
 * Dados do envio pendente de validação por pares de uma tarefa concluída.
 */
export interface PendingTaskValidation {
  /** URL pública da foto comprobatória enviada pelo executor */
  photoUrl: string | null;
  /** UUID do morador que executou e enviou a comprovação */
  executorId: string | null;
  /** Timestamp de envio do comprovante pelo executor */
  sentAt: string | null;
}

/**
 * Converte strings amigáveis de prazo (ex.: "Hoje, 22:00", "Amanhã, 10:00", "Em 2 dias")
 * em uma string ISO 8601 compatível com colunas TIMESTAMPTZ do PostgreSQL.
 *
 * @param deadlineStr Texto descritivo ou ISO do prazo desejado.
 * @returns Timestamp UTC formatado em ISO 8601.
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

  // Padrão "DD/MM/YYYY" com horário opcional "HH:mm"
  const brDateMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:.*(\d{1,2}):(\d{2}))?/);
  if (brDateMatch) {
    const day = parseInt(brDateMatch[1], 10);
    const month = parseInt(brDateMatch[2], 10) - 1;
    const year = parseInt(brDateMatch[3], 10);
    const hours = brDateMatch[4] ? parseInt(brDateMatch[4], 10) : 18;
    const minutes = brDateMatch[5] ? parseInt(brDateMatch[5], 10) : 0;
    const parsed = new Date(year, month, day, hours, minutes, 0);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Fallback: 24h a partir de agora
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Converte timestamp ISO do banco para rótulo legível em português.
 *
 * @param isoString Data e hora em formato ISO 8601 vinda do banco (opcional).
 * @returns Rótulo amigável (ex.: "Hoje, 22:00", "Amanhã, 10:00" ou "DD/MM, HH:mm").
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
 * @returns Objeto formatado com ícones e estilos visuais.
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
  if (row.status === 'em_validacao' || (row.status as string) === 'Aguardando validação') {
    visualStatus = 'Aguardando validação';
  } else if (row.status === 'concluida' || (row.status as string) === 'Concluída') {
    visualStatus = 'Concluída';
  }

  const isUserResponsible = !!currentUserId && row.responsavel_id === currentUserId;
  const rawName = row.responsavel?.nome_completo || row.responsavel_nome || 'Morador';
  const assigneeDisplay = isUserResponsible ? 'Você' : rawName;
  const requiresValidation = visualStatus === 'Aguardando validação';

  return {
    id: row.id,
    title: row.titulo,
    type: row.tipo,
    location: row.comodo,
    deadline: row.prazo_limite ? formatPrazoLimite(row.prazo_limite) : (row.prazo || 'Hoje, 22:00'),
    xp: row.recompensa_xp ?? (row as any).xp ?? 25,
    points: row.recompensa_moedas ?? (row as any).moedas ?? 10,
    assigneeId: row.responsavel_id ?? undefined,
    assignee: assigneeDisplay,
    status: visualStatus,
    icon,
    iconBg,
    iconColor,
    requiresValidation,
    executorInfo:
      requiresValidation
        ? row.executor_info || `Executada por ${assigneeDisplay === 'Você' ? 'você' : rawName} com foto`
        : undefined,
  };
}

/** Helper para anexar nomes da tabela 'perfis' às tarefas sem depender de join FK no PostgREST. */
async function attachResponsavelProfiles(rows: TarefaDB[]): Promise<TarefaDB[]> {
  const ids = Array.from(new Set(rows.map((r) => r.responsavel_id).filter(Boolean))) as string[];
  if (ids.length === 0) return rows;

  const { data: perfis } = await supabase
    .from('perfis')
    .select('id, nome_completo')
    .in('id', ids);

  const perfilMap = new Map<string, { id: string; nome_completo: string | null }>();
  (perfis || []).forEach((p: { id: string; nome_completo: string | null }) => {
    perfilMap.set(p.id, p);
  });

  return rows.map((row) => ({
    ...row,
    responsavel: row.responsavel_id ? perfilMap.get(row.responsavel_id) ?? row.responsavel ?? null : null,
  }));
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
   * @returns Lista de tarefas para exibição.
   */
  async fetchTasks(moradiaId?: string, currentUserId?: string): Promise<TaskItem[]> {
    if (!moradiaId) {
      return [];
    }

    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('moradia_id', moradiaId)
      .order('prazo_limite', { ascending: true });

    if (error) {
      console.warn('Supabase: Erro ao buscar tarefas:', error.message);
      throw new Error(error.message || 'Não foi possível carregar as tarefas.');
    }
    if (!data) {
      return [];
    }

    const enriched = await attachResponsavelProfiles(data as TarefaDB[]);
    return enriched.map((row) => mapRowToTaskItem(row, currentUserId));
  },

  /**
   * Registra uma nova tarefa na tabela 'tarefas' do Supabase.
   *
   * @param formData Dados preenchidos no formulário de criação.
   * @param userId UUID do usuário criador.
   * @param moradiaId UUID da moradia vinculada.
   * @returns Tarefa criada e formatada.
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

    const basePayload: any = {
      moradia_id: moradiaId,
      titulo: formData.title,
      descricao: formData.location ? `Cômodo: ${formData.location}` : null,
      comodo: formData.location || 'Geral',
      tipo: formData.type,
      responsavel_id: targetResponsavelId,
      prazo_limite: parseDeadlineToISO(formData.deadline),
      recompensa_xp: formData.xp ?? 25,
      recompensa_moedas: formData.points ?? 10,
      requer_validacao: false,
      status: 'pendente' as const,
      criado_por: userId || targetResponsavelId,
    };

    let { data, error } = await supabase
      .from('tarefas')
      .insert(basePayload)
      .select('*')
      .single();

    // Se o banco tiver a coluna legada 'prazo' requerida, tenta incluir
    if (error && (error.code === '23502' || error.message?.includes('prazo'))) {
      const fallbackPayload = {
        ...basePayload,
        prazo: formData.deadline || 'Hoje, 22:00',
      };
      const retry = await supabase
        .from('tarefas')
        .insert(fallbackPayload)
        .select('*')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Supabase: Erro ao salvar tarefa:', error);
      throw new Error(error?.message || 'Falha ao salvar tarefa no banco.');
    }

    const [enriched] = await attachResponsavelProfiles([data as TarefaDB]);
    return mapRowToTaskItem(enriched, userId);
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

    const { data: valInserted, error: valError } = await supabase
      .from('validacoes_tarefa')
      .insert({
        tarefa_id: taskId,
        executor_id: executorId,
        foto_comprovante_url: photoUrl,
        data_hora_foto: new Date().toISOString(),
        status: 'pendente',
      })
      .select('id')
      .single();
    if (valError || !valInserted) {
      throw new Error(`Falha ao registrar a validação: ${valError?.message || 'Erro desconhecido.'}`);
    }

    const nowIso = new Date().toISOString();
    let { data: updatedTask, error } = await supabase
      .from('tarefas')
      .update({
        status: 'em_validacao',
        requer_validacao: true,
        foto_comprovante_url: photoUrl,
        atualizado_em: nowIso,
      })
      .eq('id', taskId)
      .in('status', ['pendente', 'Pendente'])
      .select('id')
      .maybeSingle();

    if (error && (error.code === '42703' || error.code === 'PGRST204')) {
      const retry = await supabase
        .from('tarefas')
        .update({
          status: 'em_validacao',
          requer_validacao: true,
          atualizado_em: nowIso,
        })
        .eq('id', taskId)
        .in('status', ['pendente', 'Pendente'])
        .select('id')
        .maybeSingle();
      updatedTask = retry.data;
      error = retry.error;
    }

    if (error || !updatedTask) {
      await supabase.from('validacoes_tarefa').delete().eq('id', valInserted.id);
      throw new Error(
        error
          ? `Falha ao atualizar a tarefa: ${error.message}`
          : 'A tarefa não está mais pendente para envio de validação.'
      );
    }

    return photoUrl;
  },

  /**
   * Busca a foto e os dados do envio pendente de validação de uma tarefa.
   *
   * @param taskId UUID da tarefa consultada.
   * @returns Dados da comprovação pendente de análise ou null se não houver envio aberto.
   */
  async getPendingValidation(
    taskId: string
  ): Promise<PendingTaskValidation | null> {
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
        sentAt: row.data_hora_foto || row.criado_em || row.created_at || null,
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
   * @returns Sucesso da validação.
   */
  async validateTask(
    taskId: string,
    validatorId: string,
    approved: boolean,
    justification?: string
  ): Promise<boolean> {
    if (!approved && !justification?.trim()) {
      throw new Error('Informe uma justificativa ao recusar a tarefa.');
    }

    const { data: currentTask, error: taskFetchError } = await supabase
      .from('tarefas')
      .select('id, moradia_id, responsavel_id, status')
      .eq('id', taskId)
      .single();

    if (taskFetchError || !currentTask) {
      throw new Error('Tarefa não encontrada para validação.');
    }

    const pending = await this.getPendingValidation(taskId);
    const executorId = pending?.executorId || currentTask.responsavel_id;
    if (validatorId && executorId && validatorId === executorId) {
      throw new Error('Regra RN-09: Você não pode validar a própria tarefa.');
    }

    // 1. Atualiza estado em tarefas atomicamente somente se ainda estiver aguardando validação
    const newStatus = approved ? 'concluida' : 'pendente';
    const nowIso = new Date().toISOString();
    let { data: updatedTask, error } = await supabase
      .from('tarefas')
      .update({
        status: newStatus,
        requer_validacao: false,
        concluido_em: approved ? nowIso : null,
        atualizado_em: nowIso,
      })
      .eq('id', taskId)
      .in('status', ['em_validacao', 'Aguardando validação'])
      .select('moradia_id, responsavel_id, recompensa_xp, recompensa_moedas')
      .maybeSingle();

    if (error && (error.code === '42703' || error.code === 'PGRST204')) {
      const retry = await supabase
        .from('tarefas')
        .update({
          status: newStatus,
          requer_validacao: false,
          atualizado_em: nowIso,
        })
        .eq('id', taskId)
        .in('status', ['em_validacao', 'Aguardando validação'])
        .select('moradia_id, responsavel_id, recompensa_xp, recompensa_moedas')
        .maybeSingle();
      updatedTask = retry.data;
      error = retry.error;
    }

    if (error || !updatedTask) {
      console.error('Supabase: Tarefa não encontrada ou não está aguardando validação:', error?.message);
      return false;
    }

    const rollbackTaskToWaitingValidation = async () => {
      const rb = await supabase
        .from('tarefas')
        .update({ status: 'em_validacao', requer_validacao: true, concluido_em: null, atualizado_em: nowIso })
        .eq('id', taskId);
      if (rb.error && (rb.error.code === '42703' || rb.error.code === 'PGRST204')) {
        await supabase
          .from('tarefas')
          .update({ status: 'em_validacao', requer_validacao: true, atualizado_em: nowIso })
          .eq('id', taskId);
      }
    };

    // 2. Atualiza o envio pendente na tabela validacoes_tarefa
    const { data: valUpdatedRows, error: valError } = await supabase
      .from('validacoes_tarefa')
      .update({
        validador_id: validatorId,
        status: approved ? 'aprovada' : 'recusada',
        justificativa: justification?.trim() || null,
        validado_em: nowIso,
      })
      .eq('tarefa_id', taskId)
      .eq('status', 'pendente')
      .select('id');

    if (valError) {
      console.error('Supabase: Erro ao atualizar validacao:', valError.message);
      await rollbackTaskToWaitingValidation();
      return false;
    }

    // 3. Se aprovada, credita XP e Moedas e recalcula nível e título honorífico
    if (approved) {
      const targetUserId = updatedTask.responsavel_id || executorId;
      if (!targetUserId) {
        return true;
      }

      const { data: membro, error: membFetchError } = await supabase
        .from('membros_moradia')
        .select('id, xp, moedas, nivel')
        .eq('moradia_id', updatedTask.moradia_id)
        .eq('usuario_id', targetUserId)
        .single();

      if (membFetchError || !membro) {
        console.error('Supabase: Erro ao buscar membro para creditar recompensa:', membFetchError?.message);
        if (valUpdatedRows && valUpdatedRows.length > 0) {
          await supabase
            .from('validacoes_tarefa')
            .update({ validador_id: null, status: 'pendente', justificativa: null, validado_em: null })
            .in('id', valUpdatedRows.map((v: any) => v.id));
        }
        await rollbackTaskToWaitingValidation();
        return false;
      }

      const xpReward = updatedTask.recompensa_xp ?? 25;
      const coinReward = updatedTask.recompensa_moedas ?? 10;

      const newXp = (membro.xp || 0) + xpReward;
      const newMoedas = (membro.moedas || 0) + coinReward;
      const { level: newLevel, title: newTitle } = calculateLevelAndTitle(newXp);

      let { error: updateMembError } = await supabase
        .from('membros_moradia')
        .update({
          xp: newXp,
          moedas: newMoedas,
          nivel: newLevel,
          titulo_nivel: newTitle,
        })
        .eq('id', membro.id);

      if (updateMembError && (updateMembError.code === '42703' || updateMembError.code === 'PGRST204')) {
        const retry = await supabase
          .from('membros_moradia')
          .update({
            xp: newXp,
            moedas: newMoedas,
            nivel: newLevel,
          })
          .eq('id', membro.id);
        updateMembError = retry.error;
      }

      if (updateMembError) {
        console.error('Supabase: Erro ao creditar saldo do membro:', updateMembError.message);
        if (valUpdatedRows && valUpdatedRows.length > 0) {
          await supabase
            .from('validacoes_tarefa')
            .update({ validador_id: null, status: 'pendente', justificativa: null, validado_em: null })
            .in('id', valUpdatedRows.map((v: any) => v.id));
        }
        await rollbackTaskToWaitingValidation();
        return false;
      }
    }

    return true;
  },
};
