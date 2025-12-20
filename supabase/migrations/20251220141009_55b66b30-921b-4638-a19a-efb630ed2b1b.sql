-- Add visual_theme JSON field to learning_worlds for unique styling per world
ALTER TABLE public.learning_worlds 
ADD COLUMN IF NOT EXISTS visual_theme jsonb DEFAULT '{}'::jsonb;

-- Add detected_subject field to store AI-detected subject
ALTER TABLE public.learning_worlds 
ADD COLUMN IF NOT EXISTS detected_subject text;

COMMENT ON COLUMN public.learning_worlds.visual_theme IS 'AI-generated visual theme with mood, era, colors, and style hints';
COMMENT ON COLUMN public.learning_worlds.detected_subject IS 'AI-detected subject based on content analysis';