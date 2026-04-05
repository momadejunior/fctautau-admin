-- Execute este comando no Editor SQL do seu projeto Supabase:

-- 1. Tabela de Coleções (Álbuns)
CREATE TABLE IF NOT EXISTS public.colecoes (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Adicionar colecao_id na tabela media (se não existir)
-- Nota: A tabela 'media' já deve existir via create_media.sql
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS colecao_id INTEGER REFERENCES public.colecoes(id) ON DELETE SET NULL;

-- 3. Ativar RLS se necessário
ALTER TABLE public.colecoes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para coleções
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'colecoes') THEN
        CREATE POLICY "Public Read Access" ON public.colecoes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert Access' AND tablename = 'colecoes') THEN
        CREATE POLICY "Public Insert Access" ON public.colecoes FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update Access' AND tablename = 'colecoes') THEN
        CREATE POLICY "Public Update Access" ON public.colecoes FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Delete Access' AND tablename = 'colecoes') THEN
        CREATE POLICY "Public Delete Access" ON public.colecoes FOR DELETE USING (true);
    END IF;
END $$;
