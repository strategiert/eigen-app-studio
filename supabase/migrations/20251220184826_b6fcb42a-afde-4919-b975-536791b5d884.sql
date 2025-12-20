-- Enable REPLICA IDENTITY FULL for complete row data in realtime updates
ALTER TABLE public.learning_worlds REPLICA IDENTITY FULL;

-- Make sure table is in realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'learning_worlds'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_worlds;
  END IF;
END $$;