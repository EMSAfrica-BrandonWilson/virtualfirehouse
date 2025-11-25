-- Migration: Add room photos support and simplify fire station rooms schema
-- Created: 2025-10-30
-- Description: Adds room_photos field and makes menu_item_id optional for simplified room management

-- Add room_photos field to store array of photo URLs from Supabase Storage
ALTER TABLE fire_station_rooms 
ADD COLUMN IF NOT EXISTS room_photos TEXT[];

-- Make menu_item_id optional to allow direct room addition without menu items
ALTER TABLE fire_station_rooms 
ALTER COLUMN menu_item_id DROP NOT NULL;

-- Remove unique constraint that includes menu_item_id
ALTER TABLE fire_station_rooms 
DROP CONSTRAINT IF EXISTS fire_station_rooms_menu_item_id_room_name_key;

-- Add new unique constraint without menu_item_id for simplified direct room addition
ALTER TABLE fire_station_rooms
ADD CONSTRAINT fire_station_rooms_fire_station_room_name_key 
UNIQUE (fire_station_id, room_name);

-- Update trigger function to handle optional menu_item_id
CREATE OR REPLACE FUNCTION log_room_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO room_audit_log (room_id, action, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'CREATE', to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO room_audit_log (room_id, action, old_values, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO room_audit_log (room_id, action, old_values, changed_by_staff_id)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD), OLD.created_by_staff_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for room photos (using Edge Function approach)
-- Note: This will be handled by a separate edge function deployment

-- Update RLS policies for simplified room access
DROP POLICY IF EXISTS "Department users can view rooms" ON fire_station_rooms;
DROP POLICY IF EXISTS "Admin users can manage rooms" ON fire_station_rooms;

-- Allow authenticated users to view rooms in their department's fire stations
CREATE POLICY "Users can view department fire station rooms" ON fire_station_rooms
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fire_stations_vfh fs
        JOIN emergency_departments ed ON fs.department_id = ed.id
        JOIN staff_basic_info sbi ON sbi.department_id = ed.id
        WHERE sbi.user_id = auth.uid()
        AND fire_station_rooms.fire_station_id = fs.id
    )
);

-- Allow authenticated users with staff record to insert rooms
CREATE POLICY "Staff can insert fire station rooms" ON fire_station_rooms
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM staff_basic_info sbi
        WHERE sbi.user_id = auth.uid()
        AND sbi.id = created_by_staff_id
    )
);

-- Allow staff to update rooms they have access to
CREATE POLICY "Staff can update fire station rooms" ON fire_station_rooms
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fire_stations_vfh fs
        JOIN emergency_departments ed ON fs.department_id = ed.id
        JOIN staff_basic_info sbi ON sbi.department_id = ed.id
        WHERE sbi.user_id = auth.uid()
        AND fire_station_rooms.fire_station_id = fs.id
    )
);

-- Allow staff to delete rooms they have access to
CREATE POLICY "Staff can delete fire station rooms" ON fire_station_rooms
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fire_stations_vfh fs
        JOIN emergency_departments ed ON fs.department_id = ed.id
        JOIN staff_basic_info sbi ON sbi.department_id = ed.id
        WHERE sbi.user_id = auth.uid()
        AND fire_station_rooms.fire_station_id = fs.id
    )
);

-- Add helpful comments
COMMENT ON COLUMN fire_station_rooms.room_photos IS 'Array of Supabase Storage paths for room photos';
COMMENT ON COLUMN fire_station_rooms.menu_item_id IS 'Optional reference to menu item - can be null for direct room addition';

-- Migration completed successfully
