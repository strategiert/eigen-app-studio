-- Update the policy to use 'creator' instead of 'teacher'
DROP POLICY IF EXISTS "Teachers can create worlds" ON public.learning_worlds;

CREATE POLICY "Creators can create worlds" 
ON public.learning_worlds 
FOR INSERT
WITH CHECK ((auth.uid() = creator_id) AND has_role(auth.uid(), 'creator'::app_role));