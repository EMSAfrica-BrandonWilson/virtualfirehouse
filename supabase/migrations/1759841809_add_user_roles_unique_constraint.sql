-- Migration: add_user_roles_unique_constraint
-- Created at: 1759841809

-- Add unique constraint to prevent duplicate user-role combinations
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role_name);

-- Insert admin roles for existing test users (production-ready seeding)
INSERT INTO user_roles (user_id, role_name) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email IN (
    'john.doe@vfh.com',
    'najwilson7@gmail.com',
    'testuser123@gmail.com',
    'test.user@testdomain.com',
    'testuser001@gmail.com'
) 
ON CONFLICT (user_id, role_name) DO NOTHING;;