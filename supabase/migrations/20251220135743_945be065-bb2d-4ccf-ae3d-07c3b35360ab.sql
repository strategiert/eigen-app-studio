-- Make learning-materials bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'learning-materials';

-- Add policy for public read access to learning material images
CREATE POLICY "Anyone can view learning material images"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-materials');

-- Add policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload learning materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'learning-materials');

-- Add policy for authenticated users to update their uploads
CREATE POLICY "Authenticated users can update learning materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'learning-materials');

-- Add policy for authenticated users to delete their uploads  
CREATE POLICY "Authenticated users can delete learning materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'learning-materials');