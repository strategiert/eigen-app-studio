-- Add generated_component_code column for AI-generated React components
ALTER TABLE learning_worlds 
ADD COLUMN IF NOT EXISTS generated_component_code TEXT;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_learning_worlds_has_generated_code 
ON learning_worlds ((generated_component_code IS NOT NULL));