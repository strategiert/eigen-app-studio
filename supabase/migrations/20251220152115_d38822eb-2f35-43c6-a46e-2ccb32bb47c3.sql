-- Fix storage policies: Ensure proper ownership-based access control

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Authenticated users can upload learning materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update learning materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete learning materials" ON storage.objects;

-- Create proper ownership-based policies
-- Users can only upload to their own folder (user_id/...)
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'learning-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'learning-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'learning-materials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix email exposure: Create a view that excludes email for public access
-- First, drop and recreate the public profiles policy to use a more restrictive approach
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create a function to get safe public profile data (excludes email)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  school text,
  website text,
  is_public boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.school,
    p.website,
    p.is_public,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id AND p.is_public = true
$$;

-- Recreate policy: Anyone can view public profiles but only non-sensitive fields
-- The RLS policy still applies, but frontend should use the function for public data
CREATE POLICY "Anyone can view public profiles"
ON public.profiles FOR SELECT
USING (is_public = true);

-- Add a comment noting that frontend should use get_public_profile function
COMMENT ON FUNCTION public.get_public_profile IS 'Use this function to get public profile data without exposing email addresses';