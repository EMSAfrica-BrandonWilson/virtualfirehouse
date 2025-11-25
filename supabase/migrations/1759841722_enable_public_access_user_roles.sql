-- Migration: enable_public_access_user_roles
-- Created at: 1759841722

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage all roles (for admin functions)
CREATE POLICY "Service role can manage all roles" ON user_roles
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on page_images table  
ALTER TABLE page_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read page images
CREATE POLICY "Anyone can view page images" ON page_images
    FOR SELECT USING (true);

-- Allow authenticated users to insert page images (will be filtered by admin check in edge functions)
CREATE POLICY "Authenticated users can insert page images" ON page_images
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update/delete page images (will be filtered by admin check in edge functions)
CREATE POLICY "Authenticated users can update page images" ON page_images
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete page images" ON page_images
    FOR DELETE USING (auth.uid() IS NOT NULL);;