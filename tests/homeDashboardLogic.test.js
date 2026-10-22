/**
 * Testes unitários para regras de negócio do painel principal Home (homeDashboardLogic).
 * Valida a extração de iniciais de moradores, filtragem de tarefas do dia e limites de exibição.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');

/**
 * Extrai iniciais do nome completo para exibição no avatar do morador.
 *
 * @param {string} [fullName] Nome completo.
 * @returns {string} Iniciais em caixa alta.
 */
function extractInitials(fullName) {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    return 'NO';
  }
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Filtra tarefas prioritárias do dia para o painel de visualização rápida da Home.
 *
 * @param {Array<object>} tasks Lista completa de tarefas da moradia.
 * @param {number} [limit=3] Quantidade máxima permitida.
 * @returns {Array<object>} Tarefas filtradas.
 */
function filterTodayTasks(tasks, limit = 3) {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks
    .filter((task) => {
      if (task.status === 'Concluída') {
        return false;
      }
      const deadline = (task.deadline || '').toLowerCase();
      return (
        deadline.includes('hoje') ||
        deadline.includes('amanhã') ||
        deadline.includes('14:00') ||
        deadline.includes('19:00')
      );
    })
    .slice(0, limit);
}

describe('Regras de Negócio do Painel Home (homeDashboardLogic)', () => {
  test('Deve extrair as duas primeiras iniciais de um nome completo', () => {
    assert.strictEqual(extractInitials('Gabriel Lima Pereira'), 'GL');
    assert.strictEqual(extractInitials('Norman Osborn'), 'NO');
    assert.strictEqual(extractInitials('Ana Paula Leonidas'), 'AP');
    assert.strictEqual(extractInitials('Elder Matheus'), 'EM');
  });

  test('Deve lidar com nomes simples de uma única palavra', () => {
    assert.strictEqual(extractInitials('Elder'), 'E');
  });

  test('Deve retornar fallback NO caso o nome seja nulo ou indefinido', () => {
    assert.strictEqual(extractInitials(null), 'NO');
    assert.strictEqual(extractInitials(undefined), 'NO');
    assert.strictEqual(extractInitials(''), 'NO');
  });

  test('Deve filtrar apenas tarefas não concluídas com prazos para hoje ou amanhã', () => {
    const tasks = [
      { id: '1', title: 'Lavar louça', deadline: 'Hoje, 20:00', status: 'Pendente' },
      { id: '2', title: 'Tirar o lixo', deadline: 'Hoje, 19:00', status: 'Concluída' },
      { id: '3', title: 'Limpar geladeira', deadline: 'Amanhã, 10:00', status: 'Aguardando validação' },
      { id: '4', title: 'Faxina geral', deadline: 'Próximo sábado', status: 'Pendente' },
      { id: '5', title: 'Pagar internet', deadline: 'Hoje, 14:00', status: 'Pendente' },
      { id: '6', title: 'Varrer varanda', deadline: 'Amanhã, 18:00', status: 'Pendente' },
    ];

    const filtered = filterTodayTasks(tasks, 3);
    assert.strictEqual(filtered.length, 3, 'Deve limitar ao teto de 3 tarefas');
    assert.strictEqual(filtered.some((t) => t.status === 'Concluída'), false, 'Não deve incluir tarefas concluídas');
    assert.strictEqual(filtered.some((t) => t.id === '4'), false, 'Não deve incluir prazos distantes');
  });

  test('Deve retornar array vazio caso receba lista inválida de tarefas', () => {
    assert.deepStrictEqual(filterTodayTasks(null), []);
    assert.deepStrictEqual(filterTodayTasks(undefined), []);
  });
});
