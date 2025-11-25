-- Fix incident_types table: Allow duplicate names but ensure unique display names
-- Drop the UNIQUE constraint from name field
ALTER TABLE incident_types DROP CONSTRAINT IF EXISTS incident_types_name_key;

-- Add UNIQUE constraint to display_name field
ALTER TABLE incident_types ADD CONSTRAINT incident_types_display_name_key UNIQUE (display_name);

-- Update existing data to ensure display_name values are unique
-- If there are duplicates, append a suffix to make them unique
WITH duplicates AS (
  SELECT id, 
         display_name,
         ROW_NUMBER() OVER (PARTITION BY display_name ORDER BY id) as rn
  FROM incident_types
)
UPDATE incident_types 
SET display_name = display_name || ' (' || duplicates.rn || ')'
FROM duplicates 
WHERE incident_types.id = duplicates.id 
  AND duplicates.rn > 1;

-- Create index for faster lookups on display_name (already exists but making sure)
CREATE INDEX IF NOT EXISTS idx_incident_types_display_name ON incident_types(display_name);

-- Add comment explaining the schema
COMMENT ON COLUMN incident_types.name IS 'Category name - can have duplicates (e.g., multiple "emergency" types)';
COMMENT ON COLUMN incident_types.display_name IS 'Unique display name for UI selection - must be unique across all incident types';