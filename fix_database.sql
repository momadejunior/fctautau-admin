-- Execute este comando no Editor SQL do seu projeto Supabase para corrigir os erros de carregamento:

-- 1. Adicionar colunas em falta na tabela 'golos'
ALTER TABLE public.golos ADD COLUMN IF NOT EXISTS equipe TEXT DEFAULT 'A';
ALTER TABLE public.golos ADD COLUMN IF NOT EXISTS nome_marcador_adversario TEXT;
ALTER TABLE public.golos ADD COLUMN IF NOT EXISTS minuto INTEGER;

-- 2. Garantir que a tabela 'resultados' existe e tem o índice único para evitar erros de conflito
CREATE TABLE IF NOT EXISTS public.resultados (
    id SERIAL PRIMARY KEY,
    jogo_id INTEGER REFERENCES public.jogos(id) ON DELETE CASCADE,
    golos_nossos INTEGER DEFAULT 0,
    golos_adversario INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_jogo_id UNIQUE (jogo_id)
);

-- 3. Atualizar a view de resumo se necessário (opcional, pois o app agora calcula dinamicamente)
-- DROP VIEW IF EXISTS resumo_jogos;
-- CREATE VIEW resumo_jogos AS ... (opcional)
