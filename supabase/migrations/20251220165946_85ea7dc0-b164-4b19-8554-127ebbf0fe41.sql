-- Create contact_messages table for storing contact form submissions
CREATE TABLE public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Only allow inserts via service role (Edge Function)
-- No public read access needed
CREATE POLICY "Service role can insert contact messages"
ON public.contact_messages
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can read contact messages"
ON public.contact_messages
FOR SELECT
TO service_role
USING (true);