/**
 * Testes automatizados de validação estrutural do esquema SQL do Supabase.
 * Verifica a integridade DDL de 'tarefas' e 'validacoes_tarefa', incluindo constraints e RLS.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Validação do Esquema SQL do Supabase (schema_tarefas_home.sql)', () => {
  const schemaPath = path.resolve(__dirname, '../supabase/schema_tarefas_home.sql');

  test('Arquivo schema_tarefas_home.sql deve existir e ser legível', () => {
    assert.strictEqual(fs.existsSync(schemaPath), true, 'Arquivo SQL deve existir');
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.length > 0, 'Arquivo SQL não pode estar vazio');
  });

  test('Deve conter a definição completa da tabela public.tarefas', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.tarefas'), 'Definição da tabela tarefas ausente');
    assert.ok(content.includes('id UUID PRIMARY KEY DEFAULT gen_random_uuid()'), 'Chave primária UUID ausente em tarefas');
    assert.ok(content.includes('titulo TEXT NOT NULL'), 'Campo titulo ausente');
    assert.ok(content.includes('comodo TEXT NOT NULL'), 'Campo comodo ausente');
    assert.ok(content.includes('prazo TEXT NOT NULL'), 'Campo prazo ausente');
    assert.ok(content.includes('xp INTEGER NOT NULL DEFAULT 20'), 'Campo xp ausente');
    assert.ok(content.includes('requer_validacao BOOLEAN NOT NULL DEFAULT false'), 'Campo requer_validacao ausente');
  });

  test('Deve conter restrições de verificação (CHECK) para tipos e status de tarefas', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes("CHECK (tipo IN ('Fixa', 'Rotativa', 'Emergencial'))"),
      'Restrição de tipologia de tarefa ausente'
    );
    assert.ok(
      content.includes("CHECK (status IN ('Pendente', 'Concluída', 'Aguardando validação'))"),
      'Restrição de status de ciclo de vida de tarefa ausente'
    );
  });

  test('Deve conter a definição completa da tabela public.validacoes_tarefa', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes('CREATE TABLE IF NOT EXISTS public.validacoes_tarefa'),
      'Definição da tabela validacoes_tarefa ausente'
    );
    assert.ok(
      content.includes('tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE'),
      'Chave estrangeira tarefa_id ausente'
    );
    assert.ok(
      content.includes('validador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL'),
      'Chave estrangeira validador_id ausente'
    );
    assert.ok(
      content.includes("CHECK (status IN ('aprovada', 'recusada'))"),
      'Restrição de status de validação ausente'
    );
  });

  test('Deve configurar Row Level Security (RLS) e políticas de acesso para tarefas e validações', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(
      content.includes('ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;'),
      'RLS não habilitado para tarefas'
    );
    assert.ok(
      content.includes('ALTER TABLE public.validacoes_tarefa ENABLE ROW LEVEL SECURITY;'),
      'RLS não habilitado para validacoes_tarefa'
    );
    assert.ok(
      content.includes('CREATE POLICY "Leitura de tarefas por usuarios autenticados"'),
      'Politica de leitura de tarefas ausente'
    );
    assert.ok(
      content.includes('CREATE POLICY "Insercao de tarefas por usuarios autenticados"'),
      'Politica de insercao de tarefas ausente'
    );
    assert.ok(
      content.includes('CREATE POLICY "Atualizacao de tarefas por usuarios autenticados"'),
      'Politica de atualizacao de tarefas ausente'
    );
    assert.ok(
      content.includes('CREATE POLICY "Leitura de validacoes por usuarios autenticados"'),
      'Politica de leitura de validacoes ausente'
    );
    assert.ok(
      content.includes('CREATE POLICY "Insercao de validacoes por usuarios autenticados"'),
      'Politica de insercao de validacoes ausente'
    );
  });
});
