-- Migration: rename_aoa_to_airside_permit
-- Created at: 1759879890

ALTER TABLE staff 
RENAME COLUMN aoa_expiry_date TO airside_permit_expiry_date;;