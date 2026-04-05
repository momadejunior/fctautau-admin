-- Execute este comando no Editor SQL do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.media (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('foto', 'video')) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    categoria TEXT DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS se necessário
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Política simples para leitura e escrita
CREATE POLICY "Public Read Access" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.media FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.media FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON public.media FOR DELETE USING (true);
