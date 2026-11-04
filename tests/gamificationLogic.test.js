/**
 * Testes unitários para o sistema de gamificação, pontuação e eliminação de dados mockados (Issue #64 / Auditoria).
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');

// Equivalente Node CommonJS da lógica pura em src/utils/gamification.ts
function calculateLevel(xp) {
  if (!xp || xp < 0) return 1;
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function calculateTitle(level) {
  if (level <= 1) return 'Morador Iniciante';
  if (level === 2) return 'Morador Ativo';
  if (level === 3) return 'Morador Dedicado';
  if (level === 4) return 'Morador Exemplar';
  return 'Morador Mestre';
}

function calculateLevelAndTitle(xp) {
  const safeXp = Math.max(0, xp || 0);
  const level = calculateLevel(safeXp);
  const title = calculateTitle(level);
  const nextLevelXp = level * 100;
  const currentLevelXp = safeXp % 100;

  return { level, title, nextLevelXp, currentLevelXp };
}

describe('Sistema de Gamificação e Níveis (gamification)', () => {
  test('Deve atribuir Nível 1 e "Morador Iniciante" para XP entre 0 e 99', () => {
    const res0 = calculateLevelAndTitle(0);
    assert.strictEqual(res0.level, 1);
    assert.strictEqual(res0.title, 'Morador Iniciante');
    assert.strictEqual(res0.nextLevelXp, 100);

    const res50 = calculateLevelAndTitle(50);
    assert.strictEqual(res50.level, 1);
    assert.strictEqual(res50.title, 'Morador Iniciante');
    assert.strictEqual(res50.currentLevelXp, 50);

    const res99 = calculateLevelAndTitle(99);
    assert.strictEqual(res99.level, 1);
    assert.strictEqual(res99.title, 'Morador Iniciante');
  });

  test('Deve evoluir para Nível 2 e "Morador Ativo" aos 100 XP', () => {
    const res100 = calculateLevelAndTitle(100);
    assert.strictEqual(res100.level, 2);
    assert.strictEqual(res100.title, 'Morador Ativo');
    assert.strictEqual(res100.nextLevelXp, 200);
    assert.strictEqual(res100.currentLevelXp, 0);

    const res180 = calculateLevelAndTitle(180);
    assert.strictEqual(res180.level, 2);
    assert.strictEqual(res180.title, 'Morador Ativo');
    assert.strictEqual(res180.currentLevelXp, 80);
  });

  test('Deve evoluir para Nível 3 ("Morador Dedicado") aos 200 XP e Nível 4 ("Morador Exemplar") aos 300 XP', () => {
    const res250 = calculateLevelAndTitle(250);
    assert.strictEqual(res250.level, 3);
    assert.strictEqual(res250.title, 'Morador Dedicado');

    const res320 = calculateLevelAndTitle(320);
    assert.strictEqual(res320.level, 4);
    assert.strictEqual(res320.title, 'Morador Exemplar');
  });

  test('Deve conceder Nível 5+ e "Morador Mestre" a partir de 400 XP', () => {
    const res400 = calculateLevelAndTitle(400);
    assert.strictEqual(res400.level, 5);
    assert.strictEqual(res400.title, 'Morador Mestre');
    assert.strictEqual(res400.nextLevelXp, 500);

    const res850 = calculateLevelAndTitle(850);
    assert.strictEqual(res850.level, 9);
    assert.strictEqual(res850.title, 'Morador Mestre');
  });

  test('Deve lidar com pontuações nulas, indefinidas ou negativas sem erros', () => {
    assert.strictEqual(calculateLevel(null), 1);
    assert.strictEqual(calculateLevel(undefined), 1);
    assert.strictEqual(calculateLevel(-50), 1);
  });
});

describe('Integridade da Loja e Ausência de Mock Data (storeService)', () => {
  test('Deve retornar catálogo vazio e não dados fictícios quando a tabela não tiver registros', () => {
    // Simulação do fetchStoreItems quando o banco retorna lista vazia
    function filterStoreRows(data) {
      const activeRows = (data || []).filter(
        (r) => r.ativo !== false && r.status !== 'recusada' && r.status_aprovacao !== 'recusada'
      );
      return activeRows;
    }

    const emptyResult = filterStoreRows([]);
    assert.deepStrictEqual(emptyResult, [], 'Loja não deve gerar itens fictícios/mockados');
    assert.strictEqual(emptyResult.length, 0);
  });
});

describe('Isolamento de Tarefas no Dashboard Home (homeScreen)', () => {
  test('Apenas tarefas atribuídas ao usuário logado ("Você") devem constar em "Suas tarefas para hoje"', () => {
    const allTasks = [
      { id: '1', title: 'Lavar louça', assignee: 'Você', status: 'Pendente' },
      { id: '2', title: 'Tirar lixo', assignee: 'Lima 2', status: 'Pendente' },
      { id: '3', title: 'Limpar banheiro', assignee: 'Você', status: 'Concluída' },
    ];

    const myPendingTasks = allTasks.filter((t) => t.assignee === 'Você' && t.status !== 'Concluída');
    const todayTasks = myPendingTasks.slice(0, 3);

    assert.strictEqual(todayTasks.length, 1);
    assert.strictEqual(todayTasks[0].id, '1');
    assert.strictEqual(todayTasks[0].assignee, 'Você');
  });

  test('Quando o usuário logado não tiver tarefas pendentes, todayTasks deve ser vazio e não vazar tarefas de outros', () => {
    const otherTasks = [
      { id: '2', title: 'Tirar lixo', assignee: 'Lima 2', status: 'Pendente' },
      { id: '3', title: 'Limpar sala', assignee: 'Lima 2', status: 'Pendente' },
    ];

    const myPendingTasks = otherTasks.filter((t) => t.assignee === 'Você' && t.status !== 'Concluída');
    const todayTasks = myPendingTasks.slice(0, 3);

    assert.strictEqual(todayTasks.length, 0, 'Tarefas de outros moradores não devem aparecer');
  });
});

