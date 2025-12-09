-- Seed 03_ecc_01_edob_02_incident_types with standard airport incident types
-- matching the codes currently found in 03_ecc_01_edob_01_entries

-- First, ensure we don't have duplicates for the keys we are about to insert
DELETE FROM "public"."03_ecc_01_edob_02_incident_types" 
WHERE name IN (
  'emergency01', 'emergency02', 'emergency03', 'emergency04', 
  'emergency05', 'emergency06', 'emergency07', 'general01'
);

-- Insert the data
INSERT INTO "public"."03_ecc_01_edob_02_incident_types" 
(name, display_name, incident_types, color_code, is_active)
VALUES 
('emergency01', 'Aircraft Accident', 'Emergency', '#dc3545', true),
('emergency02', 'Full Emergency', 'Emergency', '#dc3545', true),
('emergency03', 'Local Standby', 'Emergency', '#ffc107', true),
('emergency04', 'Structural Fire', 'Emergency', '#fd7e14', true),
('emergency05', 'Medical Emergency', 'Emergency', '#007bff', true),
('emergency06', 'Hazmat Incident', 'Emergency', '#28a745', true),
('emergency07', 'Motor Vehicle Accident', 'Emergency', '#6f42c1', true),
('general01', 'General Entry', 'Routine', '#6c757d', true);

-- Optional: Add a unique index to prevent future duplicates on 'name'
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_incident_types_name ON "public"."03_ecc_01_edob_02_incident_types" (name);
