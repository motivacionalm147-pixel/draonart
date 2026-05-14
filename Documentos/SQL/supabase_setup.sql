-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE
-- DRAGON ART WEB & APP
-- ==========================================
-- Copie todo este código e cole no SQL Editor do seu painel do Supabase.
-- Clique em "RUN" para executar.

-- 1. Criar tabela de perfis (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  is_pro boolean default false,
  is_admin boolean default false,
  experience_level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar segurança
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permissões de perfis
CREATE POLICY "Perfis publicos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuario insere seu perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuario atualiza seu perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Criar tabela de posts da galeria (Comunidade)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  image_url text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar segurança
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Permissões de posts
CREATE POLICY "Posts sao publicos" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Usuarios logados podem postar" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Usuario pode apagar seu post" ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins podem apagar qualquer post" ON public.posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 3. Criar Bucket (Pasta) de Armazenamento para as Artes
INSERT INTO storage.buckets (id, name, public) VALUES ('arts', 'arts', true) ON CONFLICT DO NOTHING;

-- Permissões do Bucket
CREATE POLICY "Imagens publicas" ON storage.objects FOR SELECT USING (bucket_id = 'arts');
CREATE POLICY "Usuarios podem subir imagens" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'arts' AND auth.role() = 'authenticated');

-- 4. Função Automática: Criar perfil quando o usuário se cadastrar no Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, experience_level)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', 1);
  RETURN new;
END;
$$;

-- Acionar a função sempre que houver novo cadastro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
