-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-materials',
  'learning-materials',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
);

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own learning materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'learning-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own learning materials"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own learning materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'learning-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);