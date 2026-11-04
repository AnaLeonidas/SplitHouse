-- Esquema e tabelas para o modulo de Tarefas e Painel Principal (Home)
-- Executar no SQL Editor do painel do Supabase

-- 1. Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moradia_id UUID,
    titulo TEXT NOT NULL,
    descricao TEXT,
    comodo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Fixa', 'Rotativa', 'Emergencial')),
    responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responsavel_nome TEXT,
    prazo TEXT NOT NULL,
    prazo_limite TIMESTAMPTZ,
    xp INTEGER NOT NULL DEFAULT 20,
    recompensa_xp INTEGER NOT NULL DEFAULT 25,
    moedas INTEGER NOT NULL DEFAULT 10,
    recompensa_moedas INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('Pendente', 'Concluída', 'Aguardando validação', 'pendente', 'concluida', 'em_validacao')),
    requer_validacao BOOLEAN NOT NULL DEFAULT false,
    foto_comprovante_url TEXT,
    executor_info TEXT,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT now(),
    concluido_em TIMESTAMPTZ,
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de validacoes por pares de tarefas
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

-- 3. Habilitar seguranca a nivel de linha (RLS)
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validacoes_tarefa ENABLE ROW LEVEL SECURITY;

-- 4. Politicas de acesso para usuarios autenticados
CREATE POLICY "Leitura de tarefas por usuarios autenticados"
    ON public.tarefas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de tarefas por usuarios autenticados"
    ON public.tarefas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Atualizacao de tarefas por usuarios autenticados"
    ON public.tarefas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Leitura de validacoes por usuarios autenticados"
    ON public.validacoes_tarefa FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insercao de validacoes por usuarios autenticados"
    ON public.validacoes_tarefa FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 5. Carga inicial de dados de exemplo para demonstracao
INSERT INTO public.tarefas (titulo, comodo, tipo, responsavel_nome, prazo, prazo_limite, xp, recompensa_xp, moedas, recompensa_moedas, status, requer_validacao)
VALUES
    ('Lavar louça do almoço', 'Cozinha', 'Rotativa', 'Você', 'hoje às 14:00', now(), 30, 30, 10, 10, 'pendente', false),
    ('Tirar lixo reciclável', 'Área externa', 'Fixa', 'Você', 'hoje às 19:00', now(), 15, 15, 5, 5, 'pendente', false),
    ('Aspirar tapete da sala', 'Sala de estar', 'Fixa', 'Doutor Octopus', 'hoje às 12:00', now(), 25, 25, 10, 10, 'em_validacao', true),
    ('Limpar a geladeira', 'Cozinha', 'Rotativa', 'Lagarto', 'Amanhã às 10:00', now() + interval '1 day', 40, 40, 15, 15, 'pendente', false),
    ('Comprar materiais de limpeza', 'Mercado', 'Emergencial', 'Homem-Areia', 'Em 2 dias', now() + interval '2 days', 35, 35, 10, 10, 'pendente', false)
ON CONFLICT DO NOTHING;
