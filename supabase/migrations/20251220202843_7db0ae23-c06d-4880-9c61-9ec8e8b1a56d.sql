-- Fix duplicate user_roles entries
-- Step 1: Remove duplicate entries (keep only highest role per user)
DELETE FROM public.user_roles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.user_roles
  ORDER BY user_id,
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'creator' THEN 2
      WHEN 'student' THEN 3
    END
);

-- Step 2: Add unique constraint (one role per user)
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Step 3: Change default role to 'creator'
ALTER TABLE public.user_roles
  ALTER COLUMN role SET DEFAULT 'creator';

-- Step 4: Upgrade all existing students to creators
UPDATE public.user_roles
SET role = 'creator'
WHERE role = 'student';

-- Step 5: Update handle_new_user function to assign creator role by default
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
  
  -- Default role is now creator
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  
  -- Create free subscription for new user
  INSERT INTO public.user_subscriptions (user_id, plan, world_limit)
  VALUES (NEW.id, 'free', 3);
  
  RETURN NEW;
END;
$$;