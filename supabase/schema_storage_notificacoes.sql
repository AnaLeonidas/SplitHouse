-- SplitHouse - Storage de fotos/comprovantes + RLS de notificações por usuário

-- 1. Bucket público para fotos de tarefas, comprovantes de despesas e pagamentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Upload de comprovantes por autenticados" ON storage.objects;
CREATE POLICY "Upload de comprovantes por autenticados"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'comprovantes');

DROP POLICY IF EXISTS "Leitura publica de comprovantes" ON storage.objects;
CREATE POLICY "Leitura publica de comprovantes"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'comprovantes');

-- 2. Notificações: cada usuário só enxerga, altera ou exclui as suas, mas autenticados podem inserir para outros
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de notificacoes pelo destinatario autenticado" ON public.notificacoes;
CREATE POLICY "Leitura de notificacoes pelo destinatario autenticado"
    ON public.notificacoes FOR SELECT
    TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Insercao de notificacoes por usuarios autenticados" ON public.notificacoes;
CREATE POLICY "Insercao de notificacoes por usuarios autenticados"
    ON public.notificacoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Atualizacao de notificacoes por usuarios autenticados" ON public.notificacoes;
DROP POLICY IF EXISTS "Atualizacao de notificacoes pelo destinatario" ON public.notificacoes;
CREATE POLICY "Atualizacao de notificacoes pelo destinatario"
    ON public.notificacoes FOR UPDATE
    TO authenticated
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Exclusao de notificacoes pelo destinatario" ON public.notificacoes;
CREATE POLICY "Exclusao de notificacoes pelo destinatario"
    ON public.notificacoes FOR DELETE
    TO authenticated
    USING (auth.uid() = usuario_id);

-- 3. Recompensas da loja
ALTER TABLE public.recompensas_loja ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- 4. Política de exclusão/atualização necessárias ao fluxo de validação de tarefas
DROP POLICY IF EXISTS "Atualizacao de validacoes por usuarios autenticados" ON public.validacoes_tarefa;
CREATE POLICY "Atualizacao de validacoes por usuarios autenticados"
    ON public.validacoes_tarefa FOR UPDATE
    TO authenticated
    USING (true);

