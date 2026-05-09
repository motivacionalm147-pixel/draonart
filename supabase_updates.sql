-- Script para atualizar o banco de dados do Dragon Art (Rodar no SQL Editor do Supabase)

-- 1. Tabela de Likes (Para evitar curtidas duplicadas do mesmo usuário)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Habilitar RLS para post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Usuários logados podem curtir" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem descurtir" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);


-- 2. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver comentários" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Usuários logados podem comentar" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus comentários" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);


-- 3. Atualizar a Tabela de Posts (Se necessário garantir o contador de likes)
-- O contador "likes" na tabela posts será mantido por compatibilidade,
-- mas idealmente o front-end contará as linhas em post_likes.
