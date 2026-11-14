const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey) && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [k, v] = line.trim().split('=');
    if (k === 'EXPO_PUBLIC_SUPABASE_URL') supabaseUrl = v;
    if (k === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = v;
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Testes de Integração com o Supabase: Módulo de Tarefas', () => {
  it('Deve consultar as tarefas domésticas e validar tipagem e regras de gamificação', async () => {
    const { data, error } = await supabase
      .from('tarefas')
      .select('id, moradia_id, titulo, comodo, tipo, recompensa_xp, recompensa_moedas, status, requer_validacao')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    if (data.length > 0) {
      assert.ok(typeof data[0].id === 'string');
      assert.ok(typeof data[0].titulo === 'string');
      assert.ok(typeof data[0].comodo === 'string');
      assert.ok(['Fixa', 'Rotativa', 'Emergencial'].includes(data[0].tipo));
      assert.ok(typeof data[0].recompensa_xp === 'number');
      assert.ok(typeof data[0].recompensa_moedas === 'number');
      assert.ok(typeof data[0].requer_validacao === 'boolean');
    }
  });

  it('Deve verificar a estrutura da tabela de auditoria e validação por pares (RN-09)', async () => {
    const { data, error } = await supabase
      .from('validacoes_tarefa')
      .select('id, tarefa_id, executor_id, validador_id, status')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    if (data.length > 0) {
      assert.ok(typeof data[0].id === 'string');
      assert.ok(typeof data[0].tarefa_id === 'string');
      assert.ok(['pendente', 'aprovada', 'recusada'].includes(data[0].status));
    }
  });

  it('Deve filtrar tarefas pelo status operacional da moradia sem inconsistências', async () => {
    const { data: pendentes, error: errPendentes } = await supabase
      .from('tarefas')
      .select('id, status')
      .ilike('status', '%pendente%');

    assert.strictEqual(errPendentes, null);
    assert.ok(Array.isArray(pendentes));

    const { data: concluidas, error: errConcluidas } = await supabase
      .from('tarefas')
      .select('id, status')
      .ilike('status', '%concluid%');

    assert.strictEqual(errConcluidas, null);
    assert.ok(Array.isArray(concluidas));
  });
});
