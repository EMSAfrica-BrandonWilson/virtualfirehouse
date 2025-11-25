-- Migration: fix_storage_policies_for_admin
-- Created at: 1759844670

-- Fix storage policies for admin access to page-images bucket

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Admin users can upload page images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update page images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete page images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for page images" ON storage.objects;

-- Create comprehensive storage policies for page-images bucket
-- 1. Public read access for all images in page-images bucket
CREATE POLICY "Public read access for page images" ON storage.objects
    FOR SELECT USING (bucket_id = 'page-images');

-- 2. Admin users (administrator or system_admin) can insert/upload to page-images bucket
CREATE POLICY "Admin users can upload page images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'page-images' 
        AND auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('administrator', 'system_admin')
        )
    );

-- 3. Admin users can update objects in page-images bucket
CREATE POLICY "Admin users can update page images" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'page-images' 
        AND auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('administrator', 'system_admin')
        )
    );

-- 4. Admin users can delete objects from page-images bucket
CREATE POLICY "Admin users can delete page images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'page-images' 
        AND auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_name IN ('administrator', 'system_admin')
        )
    );

-- Also ensure the bucket has proper policies
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'page-images';;