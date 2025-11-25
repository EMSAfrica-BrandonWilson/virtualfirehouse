-- Migration: add_missing_user_profile_fields
-- Created at: 1759850327

-- Add missing last_sign_in_at field to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Create user profile for the System Administrator
INSERT INTO user_profiles (id, email, role, created_at, last_sign_in_at)
VALUES (
  '98685206-8165-4327-9101-06e9c6236db1',
  'brndnwilson5@gmail.com',
  'System Administrator',
  '2025-09-22 13:50:01.207065+00',
  '2025-10-07 15:08:47.98943+00'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  last_sign_in_at = EXCLUDED.last_sign_in_at;

-- Create user profiles for other confirmed users with default Member role
INSERT INTO user_profiles (id, email, role, created_at, last_sign_in_at)
SELECT 
  u.id,
  u.email,
  'Member' as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL 
  AND u.id != '98685206-8165-4327-9101-06e9c6236db1'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  last_sign_in_at = EXCLUDED.last_sign_in_at;;