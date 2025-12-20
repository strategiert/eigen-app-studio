-- Add policy for admins to read contact messages
CREATE POLICY "Admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));