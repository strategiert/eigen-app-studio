-- Extend profiles table for teacher portfolios
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- RLS: Anyone can view public profiles
CREATE POLICY "Anyone can view public profiles"
ON public.profiles FOR SELECT
USING (is_public = true);

-- Forking support for learning_worlds
ALTER TABLE public.learning_worlds ADD COLUMN IF NOT EXISTS forked_from_id uuid REFERENCES public.learning_worlds(id) ON DELETE SET NULL;
ALTER TABLE public.learning_worlds ADD COLUMN IF NOT EXISTS fork_count integer DEFAULT 0;
ALTER TABLE public.learning_worlds ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Function to get world rating statistics
CREATE OR REPLACE FUNCTION public.get_world_rating(world_uuid uuid)
RETURNS TABLE(average_rating numeric, total_ratings bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(rating)::numeric, 1),
    COUNT(*)
  FROM public.world_ratings 
  WHERE world_id = world_uuid
$$;

-- Function to increment fork count
CREATE OR REPLACE FUNCTION public.increment_fork_count(world_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.learning_worlds
  SET fork_count = fork_count + 1
  WHERE id = world_uuid;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(world_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.learning_worlds
  SET view_count = view_count + 1
  WHERE id = world_uuid;
END;
$$;