-- Fix duplicate user_roles entries and simplify role system
-- Everyone is a creator by default - no upgrade needed

-- Step 1: Remove duplicate entries (keep only highest role per user)
-- Priority: admin > creator > student
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

-- Step 2: Drop old UNIQUE constraint and add new one (one role per user)
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Step 3: Change default role to 'creator' instead of 'student'
ALTER TABLE public.user_roles
  ALTER COLUMN role SET DEFAULT 'creator';

-- Step 4: Upgrade all existing students to creators
UPDATE public.user_roles
SET role = 'creator'
WHERE role = 'student';

-- Step 5: Update the upgrade_to_creator function (now it's a no-op, everyone is already creator)
CREATE OR REPLACE FUNCTION public.upgrade_to_creator()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- No-op: Everyone is already a creator by default
  -- Keep function for backwards compatibility
  NULL;
END;
$$;
