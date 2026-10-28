-- ==============================================================================
-- SplitHouse - Esquema SQL: Módulo de Finanças, Despesas e Acerto de Contas
-- Documentação e espelhamento das tabelas gerenciadas no Supabase PostgreSQL.
-- ==============================================================================

-- 1. Tabela de Despesas Coletivas da Moradia
CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Geral',
    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total > 0),
    data_vencimento DATE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'recorrente')),
    tipo_divisao TEXT NOT NULL DEFAULT 'igualitaria' CHECK (tipo_divisao IN ('igualitaria', 'porcentagem', 'fixo')),
    pagador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comprovante_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Rateios Individuais da Despesa
CREATE TABLE IF NOT EXISTS public.rateios_despesa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    despesa_id UUID NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    valor_parte NUMERIC(10, 2) NOT NULL CHECK (valor_parte >= 0),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
    pago_em TIMESTAMPTZ,
    UNIQUE (despesa_id, usuario_id)
);

-- 3. Tabela de Pagamentos e Acertos Bilaterais entre Moradores
CREATE TABLE IF NOT EXISTS public.pagamentos_acerto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    devedor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor > 0),
    status TEXT NOT NULL DEFAULT 'aguardando_aprovacao' CHECK (status IN ('aguardando_aprovacao', 'confirmado', 'rejeitado')),
    comprovante_url TEXT,
    metodo_pagamento TEXT NOT NULL DEFAULT 'pix',
    confirmado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rateios_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_acerto ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS
CREATE POLICY "Leitura de despesas por usuarios autenticados"
    ON public.despesas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de despesas por usuarios autenticados"
    ON public.despesas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de despesas por usuarios autenticados"
    ON public.despesas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Leitura de rateios por usuarios autenticados"
    ON public.rateios_despesa FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de rateios por usuarios autenticados"
    ON public.rateios_despesa FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de rateios por usuarios autenticados"
    ON public.rateios_despesa FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Leitura de pagamentos por usuarios autenticados"
    ON public.pagamentos_acerto FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de pagamentos por usuarios autenticados"
    ON public.pagamentos_acerto FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de pagamentos por usuarios autenticados"
    ON public.pagamentos_acerto FOR UPDATE
    TO authenticated
    USING (true);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_despesas_moradia ON public.despesas (moradia_id, status);
CREATE INDEX IF NOT EXISTS idx_rateios_despesa_usuario ON public.rateios_despesa (despesa_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_moradia ON public.pagamentos_acerto (moradia_id, status);

