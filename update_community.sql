-- ==========================================
-- SCRIPT DE ATUALIZAÃ‡ÃƒO: REDE SOCIAL DRAGON ART
-- ==========================================
-- Copie todo este cÃ³digo e cole no SQL Editor do seu painel do Supabase.
-- Clique em "RUN" para executar.

-- 1. Adicionar novas colunas na tabela 'posts'
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_private boolean default false;

-- 2. Atualizar a polÃ­tica de leitura de posts (para esconder os privados, exceto para o dono)
DROP POLICY IF EXISTS "Posts sao publicos" ON public.posts;
CREATE POLICY "Posts sao publicos" ON public.posts 
FOR SELECT USING (
  is_private = false OR auth.uid() = user_id
);

-- 3. Criar tabela de Seguidores (followers)
CREATE TABLE IF NOT EXISTS public.followers (
    id uuid default gen_random_uuid() primary key,
    follower_id uuid references auth.users(id) on delete cascade not null,
    following_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(follower_id, following_id)
);

-- Ativar seguranÃ§a para followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- PermissÃµes de followers
CREATE POLICY "Qualquer um pode ver seguidores" ON public.followers FOR SELECT USING (true);
CREATE POLICY "UsuÃ¡rios podem seguir" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "UsuÃ¡rios podem deixar de seguir" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- 4. Adicionar colunas extras no Profile para armazenar o selo (se nÃ£o existir)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge text default 'leaf';
