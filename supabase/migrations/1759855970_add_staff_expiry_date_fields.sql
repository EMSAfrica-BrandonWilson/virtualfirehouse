-- Migration: add_staff_expiry_date_fields
-- Created at: 1759855970

-- Add expiry date fields to staff_vfh table for comprehensive expiry date tracking
ALTER TABLE staff_vfh 
ADD COLUMN IF NOT EXISTS id_iqama_expiry_date DATE,
ADD COLUMN IF NOT EXISTS drivers_license_expiry_date DATE,
ADD COLUMN IF NOT EXISTS airside_id_expiry_date DATE,
ADD COLUMN IF NOT EXISTS airside_permit_expiry_date DATE;

-- Add comments to the columns for documentation
COMMENT ON COLUMN staff_vfh.id_iqama_expiry_date IS 'Expiry date for ID/Iqama document';
COMMENT ON COLUMN staff_vfh.drivers_license_expiry_date IS 'Expiry date for drivers license';
COMMENT ON COLUMN staff_vfh.airside_id_expiry_date IS 'Expiry date for airside ID';
COMMENT ON COLUMN staff_vfh.airside_permit_expiry_date IS 'Expiry date for airside permit';;