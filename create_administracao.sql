-- Execute este comando no Editor SQL do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.administracao (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    foto_url TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS se necessário (opcional, dependendo das configurações do Supabase)
ALTER TABLE public.administracao ENABLE ROW LEVEL SECURITY;

-- Política simples para leitura e escrita (ajustar conforme necessário)
CREATE POLICY "Public Read Access" ON public.administracao FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.administracao FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.administracao FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON public.administracao FOR DELETE USING (true);
