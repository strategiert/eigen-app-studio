-- Allow admins to view all learning worlds
CREATE POLICY "Admins can view all worlds" 
ON public.learning_worlds 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all learning worlds
CREATE POLICY "Admins can update all worlds" 
ON public.learning_worlds 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete all learning worlds
CREATE POLICY "Admins can delete all worlds" 
ON public.learning_worlds 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage all learning sections
CREATE POLICY "Admins can manage all sections" 
ON public.learning_sections 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));