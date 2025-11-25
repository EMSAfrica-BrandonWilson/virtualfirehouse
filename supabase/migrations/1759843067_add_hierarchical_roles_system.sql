-- Migration: add_hierarchical_roles_system
-- Created at: 1759843067

-- Create hierarchical role management system
-- Step 1: Update role_name to support new hierarchy
ALTER TABLE public.user_roles 
ALTER COLUMN role_name TYPE VARCHAR(50);

-- Step 2: Add role hierarchy validation
DO $$
BEGIN
    -- Create enum type for valid roles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('user', 'administrator', 'system_admin');
    END IF;
END$$;

-- Step 3: Add role hierarchy check constraint
ALTER TABLE public.user_roles 
ADD CONSTRAINT valid_role_hierarchy 
CHECK (role_name IN ('user', 'administrator', 'system_admin'));

-- Step 4: Create role assignment audit table for security
CREATE TABLE IF NOT EXISTS public.role_assignment_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assigned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_role VARCHAR(50),
    new_role VARCHAR(50),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- Step 5: Enable RLS on audit table
ALTER TABLE public.role_assignment_audit ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for role assignment audit
CREATE POLICY "System admins can view all role assignment history" ON public.role_assignment_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name = 'system_admin'
        )
    );

-- Step 7: Create helper function to check role hierarchy
CREATE OR REPLACE FUNCTION public.can_assign_role(
    assigner_user_id UUID,
    target_role VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Only system_admin can assign administrator role
    IF target_role = 'administrator' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = assigner_user_id 
            AND role_name = 'system_admin'
        );
    -- Only system_admin can assign system_admin role (for manual intervention)
    ELSIF target_role = 'system_admin' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = assigner_user_id 
            AND role_name = 'system_admin'
        );
    -- Anyone can assign user role (downgrade)
    ELSIF target_role = 'user' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = assigner_user_id 
            AND role_name IN ('administrator', 'system_admin')
        );
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update existing admin roles to new hierarchy
-- Convert existing 'admin' roles to 'administrator'
UPDATE public.user_roles 
SET role_name = 'administrator', updated_at = NOW()
WHERE role_name = 'admin';

-- Step 9: Assign system_admin role to brndnwilson5@gmail.com
DO $$
DECLARE
    brandon_user_id UUID;
BEGIN
    -- Get Brandon's user ID
    SELECT id INTO brandon_user_id 
    FROM auth.users 
    WHERE email = 'brndnwilson5@gmail.com';
    
    -- If Brandon exists, update his role to system_admin
    IF brandon_user_id IS NOT NULL THEN
        -- Update if exists, otherwise insert
        INSERT INTO public.user_roles (user_id, role_name, created_at, updated_at)
        VALUES (brandon_user_id, 'system_admin', NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role_name = 'system_admin',
            updated_at = NOW();
            
        -- Log this assignment
        INSERT INTO public.role_assignment_audit 
        (assigned_by_user_id, target_user_id, old_role, new_role, reason)
        VALUES 
        (brandon_user_id, brandon_user_id, 'administrator', 'system_admin', 'Initial system admin assignment during migration');
    END IF;
END$$;;