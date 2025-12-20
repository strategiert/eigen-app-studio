-- Rename 'teacher' to 'creator' in the app_role enum
ALTER TYPE public.app_role RENAME VALUE 'teacher' TO 'creator';

-- Create a function that allows users to upgrade themselves to creator
-- This is safe because becoming a creator just allows content creation
CREATE OR REPLACE FUNCTION public.upgrade_to_creator()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET role = 'creator'
  WHERE user_id = auth.uid()
    AND role = 'student';
END;
$$;