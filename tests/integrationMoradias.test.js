const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey) && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of envContent.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const k = line.slice(0, eqIndex).trim();
    const v = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k === 'EXPO_PUBLIC_SUPABASE_URL') supabaseUrl = v;
    if (k === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = v;
  }
}

const runIntegration = process.env.RUN_INTEGRATION === '1';
let supabase = null;

describe(
  'Testes de Integração com o Supabase: Módulo de Moradia e Estatuto',
  {
    skip: !runIntegration
      ? 'Defina RUN_INTEGRATION=1 para rodar testes de integração ao vivo contra o Supabase'
      : !supabaseUrl || !supabaseAnonKey
      ? 'Variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY ausentes'
      : false,
  },
  () => {
    before(() => {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    });

    it('Deve conectar ao Supabase e consultar dados estruturais de moradias', async () => {
      const { data, error } = await supabase
        .from('moradias')
        .select('id, nome, endereco, tipo, codigo_convite')
        .limit(1);

      assert.strictEqual(error, null);
      assert.ok(Array.isArray(data));
      if (data.length > 0) {
        assert.ok(typeof data[0].id === 'string');
        assert.ok(typeof data[0].nome === 'string');
        assert.ok(typeof data[0].codigo_convite === 'string');
      }
    });

    it('Deve recuperar as regras da moradia vinculadas pelo moradia_id relacional', async () => {
      const { data: houses, error: houseErr } = await supabase
        .from('moradias')
        .select('id')
        .limit(1);

      assert.strictEqual(houseErr, null);
      assert.ok(Array.isArray(houses));
      if (houses.length === 0) return;

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
  }
);
