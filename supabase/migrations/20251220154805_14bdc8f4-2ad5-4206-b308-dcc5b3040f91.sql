-- Add explicit deny policies for user_roles table
-- This follows defense-in-depth principle - roles are only managed via triggers/functions

-- Block all direct inserts (roles only created via handle_new_user trigger)
CREATE POLICY "Roles managed via triggers only"
  ON public.user_roles FOR INSERT
  WITH CHECK (false);

-- Block updates (roles can only be changed via upgrade_to_creator function)
CREATE POLICY "Roles cannot be updated directly"
  ON public.user_roles FOR UPDATE
  USING (false);

-- Block deletes (roles should persist with user lifecycle)
CREATE POLICY "Roles cannot be deleted"
  ON public.user_roles FOR DELETE
  USING (false);