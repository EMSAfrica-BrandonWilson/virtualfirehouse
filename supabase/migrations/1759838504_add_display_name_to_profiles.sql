-- Migration: add_display_name_to_profiles
-- Created at: 1759838504

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);;