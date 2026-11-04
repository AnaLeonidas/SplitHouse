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

-- 10. Tabela de Despesas Coletivas da Moradia
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

-- 11. Tabela de Rateios Individuais da Despesa
CREATE TABLE IF NOT EXISTS public.rateios_despesa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    despesa_id UUID NOT NULL REFERENCES public.despesas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    valor_parte NUMERIC(10, 2) NOT NULL CHECK (valor_parte >= 0),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
    pago_em TIMESTAMPTZ,
    UNIQUE (despesa_id, usuario_id)
);

-- 12. Tabela de Pagamentos e Acertos Bilaterais entre Moradores
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

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moradias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_moradia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_moradia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validacoes_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rateios_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_acerto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensas_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resgates_recompensa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS Isoladas por Usuário e Moradia
CREATE POLICY "Leitura de perfis por autenticados" ON public.perfis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Atualizacao do proprio perfil" ON public.perfis FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insercao do proprio perfil" ON public.perfis FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Leitura de moradias por membros ou convite" ON public.moradias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Criacao de moradias por autenticados" ON public.moradias FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Atualizacao de moradia por administradores" ON public.moradias FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.moradias.id AND usuario_id = auth.uid() AND papel = 'admin')
);

CREATE POLICY "Leitura de membros da mesma moradia" ON public.membros_moradia FOR SELECT TO authenticated USING (
    usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.membros_moradia m WHERE m.moradia_id = public.membros_moradia.moradia_id AND m.usuario_id = auth.uid())
);
CREATE POLICY "Insercao de vinculo de morador" ON public.membros_moradia FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "Atualizacao de vinculo por admin ou proprio usuario" ON public.membros_moradia FOR UPDATE TO authenticated USING (
    usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.membros_moradia m WHERE m.moradia_id = public.membros_moradia.moradia_id AND m.usuario_id = auth.uid() AND m.papel = 'admin')
);

CREATE POLICY "Leitura de regras por moradores" ON public.regras_moradia FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.regras_moradia.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Gestao de regras por administradores" ON public.regras_moradia FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.regras_moradia.moradia_id AND usuario_id = auth.uid() AND papel = 'admin')
);

CREATE POLICY "Leitura de tarefas por membros da moradia" ON public.tarefas FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.tarefas.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Insercao de tarefas por membros da moradia" ON public.tarefas FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.tarefas.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Atualizacao de tarefas por membros da moradia" ON public.tarefas FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.tarefas.moradia_id AND usuario_id = auth.uid())
);

CREATE POLICY "Acesso a validacoes por membros da moradia" ON public.validacoes_tarefa FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.tarefas t
        JOIN public.membros_moradia m ON m.moradia_id = t.moradia_id
        WHERE t.id = public.validacoes_tarefa.tarefa_id AND m.usuario_id = auth.uid()
    )
);

CREATE POLICY "Leitura de despesas por membros da moradia" ON public.despesas FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.despesas.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Insercao de despesas por membros da moradia" ON public.despesas FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.despesas.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Atualizacao de despesas por membros da moradia" ON public.despesas FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.despesas.moradia_id AND usuario_id = auth.uid())
);

CREATE POLICY "Leitura de rateios por membros da moradia" ON public.rateios_despesa FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.despesas d
        JOIN public.membros_moradia m ON m.moradia_id = d.moradia_id
        WHERE d.id = public.rateios_despesa.despesa_id AND m.usuario_id = auth.uid()
    )
);
CREATE POLICY "Insercao e atualizacao de rateios por membros" ON public.rateios_despesa FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.despesas d
        JOIN public.membros_moradia m ON m.moradia_id = d.moradia_id
        WHERE d.id = public.rateios_despesa.despesa_id AND m.usuario_id = auth.uid()
    )
);

CREATE POLICY "Leitura de pagamentos por membros da moradia" ON public.pagamentos_acerto FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.pagamentos_acerto.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Insercao de pagamentos pelo devedor" ON public.pagamentos_acerto FOR INSERT TO authenticated WITH CHECK (
    devedor_id = auth.uid()
);
CREATE POLICY "Confirmacao de pagamentos pelo credor" ON public.pagamentos_acerto FOR UPDATE TO authenticated USING (
    credor_id = auth.uid() OR devedor_id = auth.uid()
);

CREATE POLICY "Leitura de recompensas por membros" ON public.recompensas_loja FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.recompensas_loja.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Criacao de recompensas por membros" ON public.recompensas_loja FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.recompensas_loja.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Atualizacao de recompensas por membros" ON public.recompensas_loja FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.recompensas_loja.moradia_id AND usuario_id = auth.uid())
);

CREATE POLICY "Leitura de resgates por membros" ON public.resgates_recompensa FOR SELECT TO authenticated USING (
    auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM public.membros_moradia WHERE moradia_id = public.resgates_recompensa.moradia_id AND usuario_id = auth.uid())
);
CREATE POLICY "Insercao de resgate pelo proprio usuario" ON public.resgates_recompensa FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = usuario_id
);

CREATE POLICY "Leitura de notificacoes pelo destinatario" ON public.notificacoes FOR SELECT TO authenticated USING (
    auth.uid() = usuario_id
);
CREATE POLICY "Criacao de notificacoes por autenticados" ON public.notificacoes FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IS NOT NULL
);
CREATE POLICY "Atualizacao de notificacoes pelo destinatario" ON public.notificacoes FOR UPDATE TO authenticated USING (
    auth.uid() = usuario_id
);

