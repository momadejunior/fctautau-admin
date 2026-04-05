-- Execute este comando corrigido no Editor SQL do seu projeto Supabase:

-- 1. Tabela de Presenças (Lista de Convocados / Jogadores que jogaram)
-- Nota: Alterado para UUID para ser compatível com a estrutura do seu projeto.
CREATE TABLE IF NOT EXISTS public.presenca_jogos (
    id SERIAL PRIMARY KEY,
    jogo_id UUID NOT NULL REFERENCES public.jogos(id) ON DELETE CASCADE,
    jogador_id UUID NOT NULL REFERENCES public.jogadores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Impede duplicados no mesmo jogo
    UNIQUE(jogo_id, jogador_id)
);

-- Se as suas tabelas usarem INTEGER em vez de UUID, use o código abaixo em vez do de cima:
/*
CREATE TABLE IF NOT EXISTS public.presenca_jogos (
    id SERIAL PRIMARY KEY,
    jogo_id INTEGER NOT NULL REFERENCES public.jogos(id) ON DELETE CASCADE,
    jogador_id INTEGER NOT NULL REFERENCES public.jogadores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(jogo_id, jogador_id)
);
*/

-- 2. Ativar RLS
ALTER TABLE public.presenca_jogos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para presença_jogos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'presenca_jogos') THEN
        CREATE POLICY "Public Read Access" ON public.presenca_jogos FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert Access' AND tablename = 'presenca_jogos') THEN
        CREATE POLICY "Public Insert Access" ON public.presenca_jogos FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update Access' AND tablename = 'presenca_jogos') THEN
        CREATE POLICY "Public Update Access" ON public.presenca_jogos FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Delete Access' AND tablename = 'presenca_jogos') THEN
        CREATE POLICY "Public Delete Access" ON public.presenca_jogos FOR DELETE USING (true);
    END IF;
END $$;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_presenca_jogo ON public.presenca_jogos(jogo_id);
CREATE INDEX IF NOT EXISTS idx_presenca_jogador ON public.presenca_jogos(jogador_id);
