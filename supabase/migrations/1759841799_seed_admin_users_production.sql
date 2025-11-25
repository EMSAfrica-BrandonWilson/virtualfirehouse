-- Migration: seed_admin_users_production
-- Created at: 1759841799

-- Insert admin roles for existing test users (production-ready seeding)
-- This ensures admin access is available in any environment
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
ON CONFLICT (user_id, role_name) DO NOTHING;

-- Create a function to automatically grant admin role to specific test emails
CREATE OR REPLACE FUNCTION auto_grant_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-grant admin role to test emails
  IF NEW.email IN (
    'admin@vfh.com',
    'test.admin@vfh.com',
    'john.doe@vfh.com',
    'najwilson7@gmail.com'
  ) THEN
    INSERT INTO user_roles (user_id, role_name)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role_name) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign admin role on user creation
DROP TRIGGER IF EXISTS auto_admin_role_trigger ON auth.users;
CREATE TRIGGER auto_admin_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_admin_role();;