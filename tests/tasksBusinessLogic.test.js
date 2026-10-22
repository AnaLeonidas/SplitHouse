/**
 * Testes unitários para regras de negócio e ciclo de vida de tarefas domésticas (SplitHouse #61).
 * Abrange mapeamento de dados, transição de estados de validação e regra anti-fraude RN-09.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');

/**
 * Função de transformação de tarefa simulando a camada de serviço tasksService.
 *
 * @param {object} row Registro de tarefa bruto.
 * @returns {object} Tarefa formatada.
 */
function mapRowToTaskItem(row) {
  let icon = 'check-circle';
  let iconBg = 'rgba(94, 43, 151, 0.1)';
  let iconColor = '#5E2B97';

  if (row.comodo?.toLowerCase().includes('cozinha')) {
    icon = 'home';
  } else if (row.comodo?.toLowerCase().includes('lixo') || row.comodo?.toLowerCase().includes('externa')) {
    icon = 'trash-2';
  } else if (row.comodo?.toLowerCase().includes('mercado')) {
    icon = 'shopping-bag';
  }

  if (row.tipo === 'Emergencial') {
    icon = 'alert-triangle';
    iconBg = 'rgba(239, 68, 68, 0.12)';
    iconColor = '#EF4444';
  } else if (row.tipo === 'Rotativa') {
    iconBg = 'rgba(94, 43, 151, 0.12)';
    iconColor = '#5E2B97';
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
 * Aplica transição de estado ao enviar comprovação de conclusão.
 *
 * @param {object} task Tarefa atual.
 * @param {string} photoUrl URL do comprovante.
 * @param {string} executorName Nome do executor.
 * @returns {object} Tarefa atualizada.
 */
function submitTaskValidation(task, photoUrl, executorName) {
  return {
    ...task,
    status: 'Aguardando validação',
    requiresValidation: true,
    photoUrl: photoUrl || null,
    executorInfo: executorName ? `Executada por ${executorName} com foto` : 'Executada com foto para revisão',
  };
}

/**
 * Aplica auditoria de validação por pares com verificação da regra RN-09.
 *
 * @param {object} task Tarefa a ser validada.
 * @param {string} validatorId UUID do morador que está validando.
 * @param {string} executorId UUID do morador que executou a tarefa.
 * @param {boolean} approved Se foi aprovada ou recusada.
 * @param {string} [justification] Justificativa para recusa.
 * @returns {object} Resultado contendo sucesso e a tarefa atualizada.
 */
function evaluateTaskValidation(task, validatorId, executorId, approved, justification) {
  if (validatorId === executorId) {
    throw new Error('RN-09: Morador executor não pode validar sua própria tarefa');
  }

  if (!approved && !justification) {
    throw new Error('Justificativa obrigatória ao recusar uma tarefa');
  }

  return {
    success: true,
    task: {
      ...task,
      status: approved ? 'Concluída' : 'Pendente',
      requiresValidation: false,
      concluidoEm: approved ? new Date().toISOString() : null,
    },
  };
}

describe('Regras de Negócio de Tarefas (tasksBusinessLogic)', () => {
  test('Deve mapear corretamente um registro de banco para o formato visual de exibição', () => {
    const dbRow = {
      id: 'uuid-123',
      titulo: 'Comprar suprimentos',
      comodo: 'Mercado',
      tipo: 'Rotativa',
      responsavel_nome: 'Gabriel',
      prazo: 'Amanhã, 18:00',
      xp: 80,
      moedas: 25,
      status: 'Pendente',
      requer_validacao: false,
    };

    const visualItem = mapRowToTaskItem(dbRow);
    assert.strictEqual(visualItem.id, 'uuid-123');
    assert.strictEqual(visualItem.title, 'Comprar suprimentos');
    assert.strictEqual(visualItem.icon, 'shopping-bag');
    assert.strictEqual(visualItem.xp, 80);
    assert.strictEqual(visualItem.points, 25);
    assert.strictEqual(visualItem.assignee, 'Gabriel');
    assert.strictEqual(visualItem.requiresValidation, false);
  });

  test('Deve destacar visualmente tarefas do tipo Emergencial com alerta e cor de perigo', () => {
    const emergencyRow = {
      id: 'uuid-999',
      titulo: 'Vazamento urgente no banheiro',
      comodo: 'Banheiro Social',
      tipo: 'Emergencial',
      responsavel_nome: 'Elder',
      prazo: 'Hoje, urgente',
      xp: 150,
      moedas: 50,
      status: 'Pendente',
      requer_validacao: true,
    };

    const visualItem = mapRowToTaskItem(emergencyRow);
    assert.strictEqual(visualItem.icon, 'alert-triangle');
    assert.strictEqual(visualItem.iconColor, '#EF4444');
    assert.strictEqual(visualItem.type, 'Emergencial');
  });

  test('Deve transitar status para Aguardando validação ao submeter comprovação', () => {
    const initialTask = {
      id: 'task-1',
      status: 'Pendente',
      requiresValidation: false,
    };

    const submitted = submitTaskValidation(initialTask, 'https://storage/comprovante.jpg', 'Gabriel');
    assert.strictEqual(submitted.status, 'Aguardando validação');
    assert.strictEqual(submitted.requiresValidation, true);
    assert.strictEqual(submitted.executorInfo, 'Executada por Gabriel com foto');
  });

  test('Deve concluir a tarefa com timestamp ao ser aprovada por outro morador', () => {
    const task = {
      id: 'task-1',
      status: 'Aguardando validação',
      requiresValidation: true,
    };

    const result = evaluateTaskValidation(task, 'validator-id-456', 'executor-id-123', true);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.task.status, 'Concluída');
    assert.strictEqual(result.task.requiresValidation, false);
    assert.ok(result.task.concluidoEm, 'Timestamp de conclusão deve ser gerado');
  });

  test('Deve retornar a tarefa para Pendente ao ser recusada com justificativa', () => {
    const task = {
      id: 'task-1',
      status: 'Aguardando validação',
      requiresValidation: true,
    };

    const result = evaluateTaskValidation(
      task,
      'validator-id-456',
      'executor-id-123',
      false,
      'O chão da cozinha continua sujo'
    );
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.task.status, 'Pendente');
    assert.strictEqual(result.task.requiresValidation, false);
    assert.strictEqual(result.task.concluidoEm, null);
  });

  test('Deve bloquear validação quando o próprio executor tenta aprovar sua tarefa (Regra RN-09)', () => {
    const task = {
      id: 'task-1',
      status: 'Aguardando validação',
      requiresValidation: true,
    };

    assert.throws(
      () => {
        evaluateTaskValidation(task, 'same-user-id', 'same-user-id', true);
      },
      /RN-09/,
      'Deve lançar exceção violando a regra RN-09 de autovalidação'
    );
  });

  test('Deve exigir justificativa ao recusar uma tarefa', () => {
    const task = {
      id: 'task-1',
      status: 'Aguardando validação',
      requiresValidation: true,
    };

    assert.throws(
      () => {
        evaluateTaskValidation(task, 'validator-id', 'executor-id', false, '');
      },
      /Justificativa obrigatória/,
      'Recusa sem justificativa deve ser rejeitada'
    );
  });
});
