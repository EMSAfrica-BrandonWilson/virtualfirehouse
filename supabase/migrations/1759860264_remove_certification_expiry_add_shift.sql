-- Migration: remove_certification_expiry_add_shift
-- Created at: 1759860264

-- Remove certification_expiry column and add shift column
ALTER TABLE staff_vfh DROP COLUMN IF EXISTS certification_expiry;
ALTER TABLE staff_vfh ADD COLUMN IF NOT EXISTS shift VARCHAR(50);;