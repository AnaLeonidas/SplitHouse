-- ==============================================================================
-- SplitHouse - Esquema Relacional Completo Unificado (Supabase / PostgreSQL)
-- Consolidação de todos os módulos: Autenticação, Moradias, Regras, Tarefas,
-- Validações por Pares (RN-09), Ranking, Loja de Recompensas e Notificações.
-- ==============================================================================

-- 1. Tabela de Perfis de Usuários (Sincronizada com auth.users)
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    foto_url TEXT,
    chave_pix TEXT,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Moradias (Repúblicas e Apartamentos)
CREATE TABLE IF NOT EXISTS public.moradias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('casa', 'apartamento')),
    estimativa_moradores INTEGER,
    codigo_convite TEXT UNIQUE NOT NULL,
    nome_ciclo_atual TEXT DEFAULT 'Ciclo Atual',
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Membros da Moradia (Vínculos, Cargos, Gamificação XP e Moedas)
CREATE TABLE IF NOT EXISTS public.membros_moradia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    papel TEXT NOT NULL DEFAULT 'morador' CHECK (papel IN ('admin', 'morador')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'saiu')),
    nivel INTEGER NOT NULL DEFAULT 1,
    titulo_nivel TEXT NOT NULL DEFAULT 'Iniciante',
    xp INTEGER NOT NULL DEFAULT 0,
    moedas INTEGER NOT NULL DEFAULT 0,
    entrou_em TIMESTAMPTZ DEFAULT now(),
    UNIQUE (moradia_id, usuario_id)
);

-- 4. Tabela de Regras da Moradia (Estatuto de Convivência)
CREATE TABLE IF NOT EXISTS public.regras_moradia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    numero_ordem INTEGER NOT NULL DEFAULT 1,
    titulo TEXT NOT NULL,
    destaque TEXT,
    descricao TEXT NOT NULL,
    nome_icone TEXT DEFAULT 'file-text',
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Tarefas Domésticas
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID REFERENCES public.moradias(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    comodo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Fixa', 'Rotativa', 'Emergencial')),
    responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responsavel_nome TEXT,
    prazo TEXT,
    prazo_limite TIMESTAMPTZ,
    xp INTEGER NOT NULL DEFAULT 20,
    recompensa_xp INTEGER DEFAULT 25,
    recompensa_moedas INTEGER DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'Pendente',
    requer_validacao BOOLEAN NOT NULL DEFAULT false,
    foto_comprovante_url TEXT,
    executor_info TEXT,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT now(),
    concluido_em TIMESTAMPTZ,
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Validações de Tarefas por Pares (Regra Anti-Fraude RN-09)
CREATE TABLE IF NOT EXISTS public.validacoes_tarefa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
    executor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validador_nome TEXT,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovada', 'recusada')),
    justificativa TEXT,
    foto_comprovante_url TEXT,
    data_hora_foto TIMESTAMPTZ,
    validado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabela de Recompensas da Loja
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

-- 8. Tabela de Resgates de Recompensas
CREATE TABLE IF NOT EXISTS public.resgates_recompensa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recompensa_id UUID NOT NULL REFERENCES public.recompensas_loja(id) ON DELETE CASCADE,
    moradia_id UUID NOT NULL REFERENCES public.moradias(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    custo_moedas INTEGER NOT NULL CHECK (custo_moedas > 0),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'utilizado', 'cancelado')),
    resgatado_em TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabela de Notificações
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

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moradias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_moradia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_moradia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validacoes_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensas_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resgates_recompensa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS
CREATE POLICY "Leitura de perfis por autenticados" ON public.perfis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Atualizacao do proprio perfil" ON public.perfis FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Acesso a moradias por autenticados" ON public.moradias FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a membros por autenticados" ON public.membros_moradia FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a regras por autenticados" ON public.regras_moradia FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a tarefas por autenticados" ON public.tarefas FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a validacoes por autenticados" ON public.validacoes_tarefa FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a recompensas por autenticados" ON public.recompensas_loja FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a resgates por autenticados" ON public.resgates_recompensa FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso a notificacoes por autenticados" ON public.notificacoes FOR ALL TO authenticated USING (true);

