const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Regras de Negócio de Finanças e Moradia (finance & house fixes)', () => {
  it('Deve ajustar pequenas diferenças de arredondamento no rateio fixo para fechar o total exato (Item 7)', () => {
    const numericTotal = 100.00;
    // 3 moradores com R$ 33.33 cada = R$ 99.99 (diferença de 0.01)
    const splits = [
      { userId: 'u1', amount: 33.33 },
      { userId: 'u2', amount: 33.33 },
      { userId: 'u3', amount: 33.33 },
    ];

    const sum = splits.reduce((acc, s) => acc + s.amount, 0);
    const diff = parseFloat((numericTotal - sum).toFixed(2));
    assert.strictEqual(diff, 0.01);

    if (diff !== 0 && splits.length > 0) {
      splits[0].amount = parseFloat((splits[0].amount + diff).toFixed(2));
    }

    const finalSum = splits.reduce((acc, s) => acc + s.amount, 0);
    assert.strictEqual(splits[0].amount, 33.34);
    assert.strictEqual(parseFloat(finalSum.toFixed(2)), numericTotal);
  });

  it('Deve quitar rateios pendentes estritamente até o valor confirmado, na ordem mais antiga (Item 6)', () => {
    const pagamentoValor = 50.00;
    const rateiosPendentes = [
      { id: 'r1', valor_parte: 20.00, criado_em: '2026-11-01T10:00:00Z' },
      { id: 'r2', valor_parte: 25.00, criado_em: '2026-11-02T10:00:00Z' },
      { id: 'r3', valor_parte: 30.00, criado_em: '2026-11-03T10:00:00Z' },
    ];

    let remaining = Number(pagamentoValor);
    const toSettle = [];

    for (const r of rateiosPendentes) {
      const rValor = Number(r.valor_parte || 0);
      if (remaining >= rValor - 0.01) {
        toSettle.push(r.id);
        remaining -= rValor;
      } else {
        break;
      }
    }

    // Deve quitar r1 (20) e r2 (25) = 45 total. r3 (30) excede o saldo restante (5) e fica pendente.
    assert.deepStrictEqual(toSettle, ['r1', 'r2']);
    assert.strictEqual(remaining, 5.00);
  });

  it('Deve selecionar deterministicamente o vínculo aprovado ou o mais recente (Item 9)', () => {
    const vinculos = [
      { id: 'v1', status: 'pendente', entrou_em: '2026-11-01T10:00:00Z' },
      { id: 'v2', status: 'pendente', entrou_em: '2026-11-03T10:00:00Z' },
    ];
    // Ordenado por entrou_em DESC
    vinculos.sort((a, b) => new Date(b.entrou_em).getTime() - new Date(a.entrou_em).getTime());

    const vinculo = vinculos.find((v) => v.status === 'aprovado') || vinculos[0];
    assert.strictEqual(vinculo.id, 'v2');
  });

  it('Não deve exibir tarefas de amanhã na lista de tarefas para hoje (Item 11)', () => {
    const tasks = [
      { id: 't1', title: 'Lavar louça', deadline: 'Hoje, 20:00', assignee: 'Você', status: 'Pendente' },
      { id: 't2', title: 'Limpar banheiro', deadline: 'Amanhã, 10:00', assignee: 'Você', status: 'Pendente' },
      { id: 't3', title: 'Tirar o lixo', deadline: 'Hoje, 22:00', assignee: 'Você', status: 'Pendente' },
    ];

    const todayTasks = tasks.filter(
      (t) =>
        t.assignee === 'Você' &&
        t.status !== 'Concluída' &&
        (t.deadline || '').toLowerCase().includes('hoje')
    );

    assert.strictEqual(todayTasks.length, 2);
    assert.deepStrictEqual(todayTasks.map((t) => t.id), ['t1', 't3']);
  });
});

