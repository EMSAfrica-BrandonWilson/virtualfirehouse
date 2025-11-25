-- Migration: Add is_safety_equipment field to room_equipment table
-- Created: 2025-10-30
-- Description: Adds flag to mark equipment as safety equipment for better tracking

-- Add is_safety_equipment field
ALTER TABLE room_equipment 
ADD COLUMN IF NOT EXISTS is_safety_equipment BOOLEAN DEFAULT FALSE;

-- Add index for quick filtering of safety equipment
CREATE INDEX IF NOT EXISTS idx_room_equipment_safety ON room_equipment(is_safety_equipment) 
WHERE is_safety_equipment = TRUE;

-- Add comment
COMMENT ON COLUMN room_equipment.is_safety_equipment IS 'Flag indicating if this equipment is safety-critical equipment';

-- Create a view for safety equipment summary
CREATE OR REPLACE VIEW safety_equipment_summary AS
SELECT 
    fs.fire_station_name,
    fsr.room_name,
    re.equipment_name,
    re.equipment_model,
    re.quantity,
    re.condition_status,
    ret.equipment_category,
    re.next_maintenance_due
FROM room_equipment re
JOIN fire_station_rooms fsr ON re.room_id = fsr.id
JOIN fire_stations_vfh fs ON fsr.fire_station_id = fs.id
LEFT JOIN room_equipment_types ret ON re.equipment_type_id = ret.id
WHERE re.is_safety_equipment = TRUE 
AND re.is_active = TRUE
ORDER BY fs.fire_station_name, fsr.room_name, re.equipment_name;

COMMENT ON VIEW safety_equipment_summary IS 'Summary view of all safety equipment across fire stations';

-- Migration completed successfully
