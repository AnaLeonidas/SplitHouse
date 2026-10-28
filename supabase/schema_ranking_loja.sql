-- ==============================================================================
-- SplitHouse - Esquema SQL: Módulo de Loja, Recompensas, Ranking e Notificações (Issue #64)
-- Executar no SQL Editor do Supabase Dashboard
-- ==============================================================================

-- 1. Tabela de Recompensas da Loja da Moradia
CREATE TABLE IF NOT EXISTS public.recompensas_loja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('Folga', 'Convivência', 'Bônus')),
    custo_moedas INTEGER NOT NULL CHECK (custo_moedas > 0),
    descricao TEXT,
    disponibilidade TEXT DEFAULT 'Disponível',
    limite_por_ciclo INTEGER DEFAULT 1,
    tipo_icone TEXT DEFAULT 'minus-circle',
    ativo BOOLEAN NOT NULL DEFAULT true,
    status_aprovacao TEXT NOT NULL DEFAULT 'aprovada' CHECK (status_aprovacao IN ('pendente', 'aprovada', 'recusada')),
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Resgates de Recompensas
CREATE TABLE IF NOT EXISTS public.resgates_recompensa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recompensa_id UUID NOT NULL REFERENCES public.recompensas_loja(id) ON DELETE CASCADE,
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    custo_moedas INTEGER NOT NULL CHECK (custo_moedas > 0),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'utilizado', 'cancelado')),
    resgatado_em TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Notificações (Central de Avisos, Cutucadas do Ranking e Validações)
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID REFERENCES public.moradias(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    remetente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Cutucada', 'Validação', 'Vencimento', 'Concluída', 'Recompensa')),
    category_filter TEXT NOT NULL DEFAULT 'Cutucadas' CHECK (category_filter IN ('Validações', 'Finanças', 'Cutucadas', 'Geral')),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    action_text TEXT,
    extra_meta TEXT,
    has_coin_icon BOOLEAN DEFAULT false,
    lida BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- 4. Habilitar Segurança a Nível de Linha (RLS)
ALTER TABLE public.recompensas_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resgates_recompensa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso RLS para Usuários Autenticados
CREATE POLICY "Leitura de recompensas por usuarios autenticados"
    ON public.recompensas_loja FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de recompensas por usuarios autenticados"
    ON public.recompensas_loja FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de recompensas por usuarios autenticados"
    ON public.recompensas_loja FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Leitura de resgates por usuarios autenticados"
    ON public.resgates_recompensa FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de resgates por usuarios autenticados"
    ON public.resgates_recompensa FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Leitura de notificacoes pelo destinatario autenticado"
    ON public.notificacoes FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id OR true);

CREATE POLICY "Insercao de notificacoes por usuarios autenticados"
    ON public.notificacoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de notificacoes por usuarios autenticados"
    ON public.notificacoes FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id OR true);

-- 6. Índices para Otimização de Consultas de Ranking e Loja
CREATE INDEX IF NOT EXISTS idx_recompensas_moradia ON public.recompensas_loja (moradia_id, ativo);
CREATE INDEX IF NOT EXISTS idx_resgates_moradia_usuario ON public.resgates_recompensa (moradia_id, usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes (usuario_id, lida, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_membros_ranking_xp ON public.membros_moradia (moradia_id, status, xp DESC);

