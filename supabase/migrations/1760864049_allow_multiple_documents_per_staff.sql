-- Migration: Allow Multiple Documents Per Staff
-- Purpose: Remove UNIQUE constraint on staff_id to allow staff members to have multiple document records
-- Created: 2025-10-19

-- Drop the existing unique constraint on staff_id if it exists
ALTER TABLE staff_document_expiry 
DROP CONSTRAINT IF EXISTS staff_document_expiry_staff_id_key;

-- Add a comment to document the change
COMMENT ON TABLE staff_document_expiry IS 'Stores multiple document expiry records per staff member (e.g., Passport, Visa, Driver License, etc.)';
