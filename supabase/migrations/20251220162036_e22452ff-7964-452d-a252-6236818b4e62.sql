-- Add world_design JSONB column to store the complete AI-generated design
ALTER TABLE public.learning_worlds 
ADD COLUMN IF NOT EXISTS world_design jsonb DEFAULT '{}'::jsonb;