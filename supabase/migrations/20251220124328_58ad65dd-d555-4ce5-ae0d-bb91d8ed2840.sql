-- Add module_type column to learning_sections
ALTER TABLE public.learning_sections 
ADD COLUMN module_type TEXT DEFAULT 'knowledge';

-- Add check constraint for valid module types
ALTER TABLE public.learning_sections 
ADD CONSTRAINT valid_module_type 
CHECK (module_type IN ('discovery', 'knowledge', 'practice', 'reflection', 'challenge'));

-- Comment for clarity
COMMENT ON COLUMN public.learning_sections.module_type IS 'Type of learning module: discovery, knowledge, practice, reflection, or challenge';