-- Add generation tracking columns to learning_worlds
ALTER TABLE public.learning_worlds 
  ADD COLUMN IF NOT EXISTS generation_status text DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS generation_error text;

-- Enable realtime for learning_worlds
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_worlds;