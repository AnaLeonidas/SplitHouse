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

describe('Testes de Integração com o Supabase: Módulo de Finanças e Rateios', () => {
  it('Deve consultar a tabela de despesas e validar a tipagem dos dados financeiros', async () => {
    const { data, error } = await supabase
      .from('despesas')
      .select('id, moradia_id, titulo, categoria, valor_total, status, tipo_divisao, pagador_id')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    if (data.length > 0) {
      assert.ok(typeof data[0].id === 'string');
      assert.ok(typeof data[0].valor_total === 'number' || typeof data[0].valor_total === 'string');
      assert.ok(typeof data[0].titulo === 'string');
    }
  });

  it('Deve verificar a integridade da tabela de rateios individuais vinculados', async () => {
    const { data: rateios, error } = await supabase
      .from('rateios_despesa')
      .select('id, despesa_id, usuario_id, valor_parte, status')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(rateios));
    if (rateios.length > 0) {
      assert.ok(typeof rateios[0].id === 'string');
      assert.ok(typeof rateios[0].despesa_id === 'string');
      assert.ok(typeof rateios[0].usuario_id === 'string');
      assert.ok(['pendente', 'pago'].includes(rateios[0].status));
    }
  });

  it('Deve validar a tabela de acertos e transferências financeiras entre moradores', async () => {
    const { data: pagamentos, error } = await supabase
      .from('pagamentos_acerto')
      .select('id, moradia_id, devedor_id, credor_id, valor, status, metodo_pagamento')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(pagamentos));
    if (pagamentos.length > 0) {
      assert.ok(typeof pagamentos[0].id === 'string');
      assert.ok(['aguardando_aprovacao', 'confirmado', 'rejeitado'].includes(pagamentos[0].status));
      assert.strictEqual(pagamentos[0].metodo_pagamento, 'pix');
    }
  });
});
