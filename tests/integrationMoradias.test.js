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

describe('Testes de Integração com o Supabase: Módulo de Moradia e Estatuto', () => {
  it('Deve conectar ao Supabase e consultar dados estruturais de moradias', async () => {
    const { data, error } = await supabase
      .from('moradias')
      .select('id, nome, endereco, tipo, codigo_convite')
      .limit(1);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok(typeof data[0].id === 'string');
    assert.ok(typeof data[0].nome === 'string');
    assert.ok(typeof data[0].codigo_convite === 'string');
  });

  it('Deve recuperar as regras da moradia vinculadas pelo moradia_id relacional', async () => {
    const { data: houses } = await supabase
      .from('moradias')
      .select('id')
      .limit(1);

    assert.ok(houses && houses.length > 0);
    const houseId = houses[0].id;

    const { data: rules, error } = await supabase
      .from('regras_moradia')
      .select('id, moradia_id, titulo, descricao, numero_ordem')
      .eq('moradia_id', houseId);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(rules));
  });

  it('Deve validar integridade dos membros da moradia e campos de gamificação', async () => {
    const { data: members, error } = await supabase
      .from('membros_moradia')
      .select('id, moradia_id, usuario_id, papel, status, nivel, xp, moedas')
      .limit(5);

    assert.strictEqual(error, null);
    assert.ok(Array.isArray(members));
    if (members.length > 0) {
      assert.ok(['admin', 'morador'].includes(members[0].papel));
      assert.ok(typeof members[0].nivel === 'number');
      assert.ok(typeof members[0].xp === 'number');
      assert.ok(typeof members[0].moedas === 'number');
    }
  });
});
