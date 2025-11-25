-- Update staff_addresses table to support cascading geographic dropdowns
-- This migration updates the address fields to use the new structure:
-- Country -> State -> City -> Suburb -> Postal Code -> Street Address

-- Drop old columns if they exist
ALTER TABLE staff_addresses 
  DROP COLUMN IF EXISTS current_address,
  DROP COLUMN IF EXISTS permanent_address;

-- Add new columns for current address
ALTER TABLE staff_addresses
  ADD COLUMN IF NOT EXISTS current_suburb VARCHAR(255),
  ADD COLUMN IF NOT EXISTS current_street_address TEXT;

-- Add new columns for permanent address
ALTER TABLE staff_addresses
  ADD COLUMN IF NOT EXISTS permanent_suburb VARCHAR(255),
  ADD COLUMN IF NOT EXISTS permanent_street_address TEXT;

-- Comment on table
COMMENT ON TABLE staff_addresses IS 'Staff address information with cascading geographic fields';

-- Comment on columns
COMMENT ON COLUMN staff_addresses.current_country IS 'Current address country (ISO code)';
COMMENT ON COLUMN staff_addresses.current_state IS 'Current address state/province (ISO code)';
COMMENT ON COLUMN staff_addresses.current_city IS 'Current address city name';
COMMENT ON COLUMN staff_addresses.current_suburb IS 'Current address suburb/district';
COMMENT ON COLUMN staff_addresses.current_postal_code IS 'Current address postal code';
COMMENT ON COLUMN staff_addresses.current_street_address IS 'Current address street address';

COMMENT ON COLUMN staff_addresses.permanent_country IS 'Permanent address country (ISO code)';
COMMENT ON COLUMN staff_addresses.permanent_state IS 'Permanent address state/province (ISO code)';
COMMENT ON COLUMN staff_addresses.permanent_city IS 'Permanent address city name';
COMMENT ON COLUMN staff_addresses.permanent_suburb IS 'Permanent address suburb/district';
COMMENT ON COLUMN staff_addresses.permanent_postal_code IS 'Permanent address postal code';
COMMENT ON COLUMN staff_addresses.permanent_street_address IS 'Permanent address street address';
