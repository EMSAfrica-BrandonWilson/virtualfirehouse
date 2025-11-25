-- Migration: add_missing_profile_preferences
-- Created at: 1759838511

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_frequency TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter BOOLEAN DEFAULT true;;