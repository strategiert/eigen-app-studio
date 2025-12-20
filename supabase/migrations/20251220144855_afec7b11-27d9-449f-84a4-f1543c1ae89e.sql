-- Create user_followers table for follower system
CREATE TABLE public.user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows (for follower counts)
CREATE POLICY "Anyone can view follows"
ON public.user_followers FOR SELECT USING (true);

-- Users can only follow others themselves
CREATE POLICY "Users can follow"
ON public.user_followers FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can only unfollow themselves
CREATE POLICY "Users can unfollow"
ON public.user_followers FOR DELETE
USING (auth.uid() = follower_id);

-- Create helper functions for follower counts
CREATE OR REPLACE FUNCTION public.get_follower_count(user_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM user_followers WHERE following_id = user_uuid
$$;

CREATE OR REPLACE FUNCTION public.get_following_count(user_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM user_followers WHERE follower_id = user_uuid
$$;