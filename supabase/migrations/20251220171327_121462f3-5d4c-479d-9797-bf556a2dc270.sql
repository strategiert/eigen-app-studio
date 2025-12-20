-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'school');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  world_limit INTEGER NOT NULL DEFAULT 3,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check world limit
CREATE OR REPLACE FUNCTION public.check_world_limit(check_user_id UUID)
RETURNS TABLE(can_create BOOLEAN, current_count BIGINT, max_limit INTEGER, current_plan subscription_plan)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_sub AS (
    SELECT plan, world_limit 
    FROM user_subscriptions 
    WHERE user_id = check_user_id
  ),
  world_count AS (
    SELECT COUNT(*) as cnt 
    FROM learning_worlds 
    WHERE creator_id = check_user_id
  )
  SELECT 
    (wc.cnt < COALESCE(us.world_limit, 3)) as can_create,
    wc.cnt as current_count,
    COALESCE(us.world_limit, 3) as max_limit,
    COALESCE(us.plan, 'free'::subscription_plan) as current_plan
  FROM world_count wc
  CROSS JOIN (SELECT COALESCE(us.world_limit, 3) as world_limit, COALESCE(us.plan, 'free'::subscription_plan) as plan FROM user_sub us) us;
$$;

-- Function to create subscription for new users (called from existing trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  -- Create free subscription for new user
  INSERT INTO public.user_subscriptions (user_id, plan, world_limit)
  VALUES (NEW.id, 'free', 3);
  
  RETURN NEW;
END;
$$;

-- Create subscriptions for existing users who don't have one
INSERT INTO public.user_subscriptions (user_id, plan, world_limit)
SELECT id, 'free', 3 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;