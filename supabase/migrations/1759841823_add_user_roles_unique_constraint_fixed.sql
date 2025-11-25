-- Migration: add_user_roles_unique_constraint_fixed
-- Created at: 1759841823

-- Add unique constraint to prevent duplicate user-role combinations
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role_name);;