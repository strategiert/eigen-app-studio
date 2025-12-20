-- Fix storage security: Source documents should be private, generated images can be public

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view learning material images" ON storage.objects;

-- Policy 1: Allow public viewing of generated world images only
-- World images are stored as {world_id}/{section_id}.{ext} where world_id is a UUID
CREATE POLICY "Anyone can view world images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-materials'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND NOT (storage.foldername(name))[2] ~ '^[0-9]+-'
);

-- Policy 2: Allow users to view their own uploaded source documents
-- User uploads are stored as {user_id}/{timestamp}-{filename}
CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);