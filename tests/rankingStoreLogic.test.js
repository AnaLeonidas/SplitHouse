/**
 * Testes automatizados para as Regras de Negócio e Esquema SQL de Ranking, Loja e Recompensas (Issue #64).
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Validação do Esquema SQL de Ranking e Loja (schema_ranking_loja.sql)', () => {
  const schemaPath = path.resolve(__dirname, '../supabase/schema_ranking_loja.sql');

  test('Arquivo schema_ranking_loja.sql deve existir e ser legível', () => {
    assert.strictEqual(fs.existsSync(schemaPath), true, 'Arquivo SQL deve existir');
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.length > 0, 'Arquivo SQL não pode estar vazio');
  });

  test('Deve conter a definição completa da tabela public.recompensas_loja com constraints', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes('CREATE TABLE IF NOT EXISTS public.recompensas_loja'),
      'Definição de recompensas_loja ausente'
    );
    assert.ok(
      content.includes("CHECK (categoria IN ('Folga', 'Convivência', 'Bônus'))"),
      'Restrição CHECK de categoria ausente em recompensas_loja'
    );
    assert.ok(
      content.includes('CHECK (custo_moedas > 0)'),
      'Restrição de custo de moedas positivo ausente'
    );
    assert.ok(
      content.includes("CHECK (status_aprovacao IN ('pendente', 'aprovada', 'recusada'))"),
      'Restrição de status de aprovação ausente'
    );
  });

  test('Deve conter a definição completa da tabela public.resgates_recompensa com FKs e status', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes('CREATE TABLE IF NOT EXISTS public.resgates_recompensa'),
      'Definição de resgates_recompensa ausente'
    );
    assert.ok(
      content.includes('REFERENCES public.recompensas_loja(id) ON DELETE CASCADE'),
      'Chave estrangeira para recompensa_id ausente'
    );
    assert.ok(
      content.includes("CHECK (status IN ('ativo', 'utilizado', 'cancelado'))"),
      'Restrição CHECK de status do resgate ausente'
    );
  });

  test('Deve conter a definição completa da tabela public.notificacoes para cutucadas e avisos', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes('CREATE TABLE IF NOT EXISTS public.notificacoes'),
      'Definição de notificacoes ausente'
    );
    assert.ok(
      content.includes("CHECK (tipo IN ('Cutucada', 'Validação', 'Vencimento', 'Concluída', 'Recompensa'))"),
      'Restrição CHECK de tipo de notificação ausente'
    );
    assert.ok(
      content.includes('lida BOOLEAN NOT NULL DEFAULT false'),
      'Campo lida com default false ausente'
    );
  });

  test('Deve habilitar RLS e configurar políticas de segurança para loja, resgates e notificações', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.includes('ALTER TABLE public.recompensas_loja ENABLE ROW LEVEL SECURITY;'), 'RLS ausente em recompensas');
    assert.ok(content.includes('ALTER TABLE public.resgates_recompensa ENABLE ROW LEVEL SECURITY;'), 'RLS ausente em resgates');
    assert.ok(content.includes('ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;'), 'RLS ausente em notificacoes');
    assert.ok(content.includes('CREATE POLICY "Leitura de recompensas por usuarios autenticados"'), 'Politica de leitura de recompensas ausente');
    assert.ok(content.includes('CREATE POLICY "Insercao de resgates por usuarios autenticados"'), 'Politica de insercao de resgates ausente');
    assert.ok(content.includes('CREATE POLICY "Insercao de notificacoes por usuarios autenticados"'), 'Politica de notificacoes ausente');
  });
});

describe('Regras de Negócio de Gamificação e Ranking (rankingService)', () => {
  // Simulação da lógica de cálculo e ordenação do rankingService
  function computeRanking(members, tasks, currentUserId) {
    const mapped = members.map((m) => {
      const completed = tasks.filter(
        (t) => t.responsavel_id === m.usuario_id && (t.status === 'concluida' || t.status === 'Concluída')
      ).length;

      const pending = tasks.filter(
        (t) => t.responsavel_id === m.usuario_id && (t.status === 'pendente' || t.status === 'Pendente')
      ).length;

      return {
        id: m.id,
        name: m.nome,
        isCurrentUser: m.usuario_id === currentUserId,
        tasksCompleted: completed,
        coins: m.moedas || 0,
        xp: m.xp || 0,
        level: m.nivel || Math.max(1, Math.floor((m.xp || 0) / 100) + 1),
        pendingTasksCount: pending,
        highlightNudge: pending > 0,
      };
    });

    mapped.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.tasksCompleted - a.tasksCompleted;
    });

    return mapped.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  test('Deve ordenar moradores estritamente por XP decrescente e atribuir posições corretas', () => {
    const members = [
      { id: '1', usuario_id: 'u1', nome: 'Elder', xp: 50, moedas: 20 },
      { id: '2', usuario_id: 'u2', nome: 'Matheus', xp: 120, moedas: 80 },
      { id: '3', usuario_id: 'u3', nome: 'Gabriel', xp: 90, moedas: 50 },
    ];
    const tasks = [];

    const ranking = computeRanking(members, tasks, 'u3');

    assert.strictEqual(ranking[0].name, 'Matheus', 'Líder deve ter maior XP');
    assert.strictEqual(ranking[0].rank, 1);
    assert.strictEqual(ranking[1].name, 'Gabriel');
    assert.strictEqual(ranking[1].rank, 2);
    assert.strictEqual(ranking[1].isCurrentUser, true);
    assert.strictEqual(ranking[2].name, 'Elder');
    assert.strictEqual(ranking[2].rank, 3);
  });

  test('Deve desempatar moradores com mesmo XP pela quantidade de tarefas concluídas', () => {
    const members = [
      { id: '1', usuario_id: 'u1', nome: 'Morador A', xp: 100, moedas: 10 },
      { id: '2', usuario_id: 'u2', nome: 'Morador B', xp: 100, moedas: 10 },
    ];
    const tasks = [
      { responsavel_id: 'u1', status: 'concluida' },
      { responsavel_id: 'u2', status: 'concluida' },
      { responsavel_id: 'u2', status: 'concluida' },
    ];

    const ranking = computeRanking(members, tasks);

    assert.strictEqual(ranking[0].name, 'Morador B', 'Quem cumpriu mais tarefas deve desempatar na frente');
    assert.strictEqual(ranking[0].tasksCompleted, 2);
    assert.strictEqual(ranking[1].name, 'Morador A');
    assert.strictEqual(ranking[1].tasksCompleted, 1);
  });

  test('Deve calcular corretamente tarefas pendentes e ativar highlightNudge para cutucada', () => {
    const members = [
      { id: '1', usuario_id: 'u1', nome: 'Morador Com Pendencia', xp: 30 },
      { id: '2', usuario_id: 'u2', nome: 'Morador Em Dia', xp: 30 },
    ];
    const tasks = [
      { responsavel_id: 'u1', status: 'pendente' },
      { responsavel_id: 'u1', status: 'Pendente' },
      { responsavel_id: 'u2', status: 'concluida' },
    ];

    const ranking = computeRanking(members, tasks);

    const comPendencia = ranking.find((r) => r.name === 'Morador Com Pendencia');
    const emDia = ranking.find((r) => r.name === 'Morador Em Dia');

    assert.strictEqual(comPendencia.pendingTasksCount, 2);
    assert.strictEqual(comPendencia.highlightNudge, true, 'Deve sugerir cutucada para quem tem pendência');
    assert.strictEqual(emDia.pendingTasksCount, 0);
    assert.strictEqual(emDia.highlightNudge, false);
  });
});

describe('Regras de Negócio da Loja de Recompensas (storeService)', () => {
  // Simulação da lógica de resgate com saldo
  function processRedemption(memberCoins, itemCost) {
    if (memberCoins < itemCost) {
      throw new Error(`Saldo insuficiente. Você possui ${memberCoins} moedas, mas a recompensa custa ${itemCost} moedas.`);
    }
    return {
      success: true,
      newBalance: memberCoins - itemCost,
    };
  }

  test('Deve processar resgate e debitar saldo corretamente quando houver moedas suficientes', () => {
    const resultado = processRedemption(250, 150);
    assert.strictEqual(resultado.success, true);
    assert.strictEqual(resultado.newBalance, 100, 'Saldo deve ser subtraído exatamente pelo custo do item');
  });

  test('Deve bloquear resgate e lançar erro claro quando saldo for menor que o custo', () => {
    assert.throws(
      () => processRedemption(50, 150),
      /Saldo insuficiente/,
      'Deve lançar exceção de saldo insuficiente'
    );
  });

  test('Deve permitir resgatar quando saldo for exatamente igual ao custo, zerando o saldo', () => {
    const resultado = processRedemption(80, 80);
    assert.strictEqual(resultado.success, true);
    assert.strictEqual(resultado.newBalance, 0);
  });

  test('Deve validar campos obrigatórios ao propor nova recompensa', () => {
    function validateProposal(title, cost) {
      if (!title || !title.trim()) {
        throw new Error('Informe o título da recompensa.');
      }
      if (!cost || Number(cost) <= 0) {
        throw new Error('O custo em moedas deve ser maior que zero.');
      }
      return true;
    }

    assert.strictEqual(validateProposal('Fim de semana livre', 120), true);
    assert.throws(() => validateProposal('', 100), /Informe o título/);
    assert.throws(() => validateProposal('Título Válido', -10), /maior que zero/);
    assert.throws(() => validateProposal('Título Válido', 0), /maior que zero/);
  });
});

describe('Regras de Negócio de Notificações (notificationsService)', () => {
  // Teste de formatação de tempo relativo
  function formatTimeAgo(isoString) {
    if (!isoString) return 'Agora';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;
    return 'Ontem';
  }

  test('Deve formatar tempos recentes como "Agora" ou "Há X min"', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(recent), 'Agora');

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(tenMinAgo), 'Há 10 min');
  });

  test('Deve mapear categorias corretas para os filtros da central de notificações', () => {
    function mapCategory(tipo, categoryFilter) {
      if (categoryFilter === 'Validações' || tipo === 'Validação') return 'Validações';
      if (categoryFilter === 'Finanças' || tipo === 'Recompensa') return 'Finanças';
      return 'Cutucadas';
    }

    assert.strictEqual(mapCategory('Cutucada', 'Cutucadas'), 'Cutucadas');
    assert.strictEqual(mapCategory('Validação', 'Validações'), 'Validações');
    assert.strictEqual(mapCategory('Recompensa', 'Finanças'), 'Finanças');
  });
});

