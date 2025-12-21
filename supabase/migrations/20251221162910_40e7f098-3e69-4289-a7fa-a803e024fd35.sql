-- Fix SECURITY DEFINER functions: Add rate limiting and ownership checks

-- 1. Create a rate limiting table for tracking function calls
CREATE TABLE IF NOT EXISTS public.function_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  target_id uuid,
  called_at timestamptz DEFAULT now(),
  UNIQUE (user_id, function_name, target_id)
);

-- Enable RLS
ALTER TABLE public.function_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only the system can manage rate limits (via SECURITY DEFINER functions)
CREATE POLICY "No direct access to rate limits"
  ON public.function_rate_limits
  FOR ALL
  USING (false);

-- 2. Replace increment_view_count with rate-limited version
-- (Allow once per user per world per hour)
CREATE OR REPLACE FUNCTION public.increment_view_count(world_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_view timestamptz;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- For anonymous users, just increment without rate limiting
  IF current_user_id IS NULL THEN
    UPDATE public.learning_worlds
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = world_uuid;
    RETURN;
  END IF;
  
  -- Check if user viewed this world recently (within 1 hour)
  SELECT called_at INTO last_view
  FROM public.function_rate_limits
  WHERE user_id = current_user_id
    AND function_name = 'view_count'
    AND target_id = world_uuid;
  
  -- If viewed within the last hour, skip increment
  IF last_view IS NOT NULL AND last_view > (now() - interval '1 hour') THEN
    RETURN;
  END IF;
  
  -- Upsert rate limit record
  INSERT INTO public.function_rate_limits (user_id, function_name, target_id, called_at)
  VALUES (current_user_id, 'view_count', world_uuid, now())
  ON CONFLICT (user_id, function_name, target_id)
  DO UPDATE SET called_at = now();
  
  -- Increment view count
  UPDATE public.learning_worlds
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = world_uuid;
END;
$$;

-- 3. Replace increment_fork_count with ownership check
-- Only the system (via edge function) should call this, 
-- but add validation that a fork actually exists
CREATE OR REPLACE FUNCTION public.increment_fork_count(world_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  fork_exists boolean;
BEGIN
  current_user_id := auth.uid();
  
  -- Must be authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify user actually created a fork of this world recently
  -- (within the last 5 minutes to prevent abuse)
  SELECT EXISTS (
    SELECT 1 FROM public.learning_worlds
    WHERE forked_from_id = world_uuid
      AND creator_id = current_user_id
      AND created_at > (now() - interval '5 minutes')
  ) INTO fork_exists;
  
  IF NOT fork_exists THEN
    RAISE EXCEPTION 'No recent fork found for this world';
  END IF;
  
  -- Increment fork count
  UPDATE public.learning_worlds
  SET fork_count = COALESCE(fork_count, 0) + 1
  WHERE id = world_uuid;
END;
$$;

-- 4. Clean up old rate limit records (create a scheduled job or manual cleanup)
-- Records older than 24 hours can be deleted
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.function_rate_limits
  WHERE called_at < (now() - interval '24 hours');
END;
$$;