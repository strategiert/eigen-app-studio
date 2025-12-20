-- Add image_url column to learning_sections for AI-generated images
ALTER TABLE public.learning_sections 
ADD COLUMN image_url TEXT;

-- Add image_prompt column to store the prompt used for generation
ALTER TABLE public.learning_sections 
ADD COLUMN image_prompt TEXT;