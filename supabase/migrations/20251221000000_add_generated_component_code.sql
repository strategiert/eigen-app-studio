-- Migration: Add generated_component_code column to learning_worlds
-- This column stores AI-generated React/JSX component code for fully unique world pages

-- Add the new column for storing AI-generated component code
ALTER TABLE learning_worlds
ADD COLUMN IF NOT EXISTS generated_component_code TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN learning_worlds.generated_component_code IS
  'AI-generated React/JSX code that renders a completely unique page for this learning world. Uses react-live for safe execution.';

-- Create an index for faster querying of worlds with generated code
CREATE INDEX IF NOT EXISTS idx_learning_worlds_has_generated_code
ON learning_worlds ((generated_component_code IS NOT NULL));
