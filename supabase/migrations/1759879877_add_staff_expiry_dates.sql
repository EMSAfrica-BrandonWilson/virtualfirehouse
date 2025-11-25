-- Migration: add_staff_expiry_dates
-- Created at: 1759879877

ALTER TABLE staff 
ADD COLUMN id_iqama_expiry_date DATE,
ADD COLUMN drivers_license_expiry_date DATE,
ADD COLUMN airside_id_expiry_date DATE,
ADD COLUMN airside_permit_expiry_date DATE;;