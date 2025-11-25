-- Migration: Create Fire Station Menu and Equipment Management System (Final)
-- Created: 2025-10-29
-- Description: Implements the complete database schema for fire station menu items and equipment management
-- Fixed data types and removed non-existent status column

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CUSTOM MENU ITEMS TABLE
-- ============================================

CREATE TABLE user_fire_station_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fire_station_id INTEGER NOT NULL REFERENCES fire_stations_vfh(id) ON DELETE CASCADE,
    menu_item_name VARCHAR(255) NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    department_id INTEGER NOT NULL REFERENCES emergency_departments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(fire_station_id, created_by_user_id, menu_item_name)
);

-- Indexes for menu items
CREATE INDEX idx_user_menu_items_fire_station ON user_fire_station_menu_items(fire_station_id);
CREATE INDEX idx_user_menu_items_department ON user_fire_station_menu_items(department_id);
CREATE INDEX idx_user_menu_items_active ON user_fire_station_menu_items(is_active);
CREATE INDEX idx_user_menu_items_display_order ON user_fire_station_menu_items(display_order);

-- ============================================
-- 2. ROOM MANAGEMENT TABLES
-- ============================================

CREATE TABLE fire_station_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES user_fire_station_menu_items(id) ON DELETE CASCADE,
    fire_station_id INTEGER NOT NULL REFERENCES fire_stations_vfh(id) ON DELETE CASCADE,
    room_name VARCHAR(255) NOT NULL,
    room_description TEXT,
    room_type VARCHAR(100), -- e.g., 'Equipment Storage', 'Garage', 'Office', 'Dormitory'
    floor_level VARCHAR(50),
    area_sqft DECIMAL(10,2),
    created_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(menu_item_id, room_name)
);

-- Indexes for rooms
CREATE INDEX idx_fire_station_rooms_menu_item ON fire_station_rooms(menu_item_id);
CREATE INDEX idx_fire_station_rooms_fire_station ON fire_station_rooms(fire_station_id);
CREATE INDEX idx_fire_station_rooms_active ON fire_station_rooms(is_active);
CREATE INDEX idx_fire_station_rooms_type ON fire_station_rooms(room_type);

CREATE TABLE room_equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_type_name VARCHAR(255) NOT NULL UNIQUE,
    equipment_category VARCHAR(100), -- 'Vehicle', 'Tools', 'Safety', 'Medical', 'Communication'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for equipment types
CREATE INDEX idx_room_equipment_types_category ON room_equipment_types(equipment_category);
CREATE INDEX idx_room_equipment_types_active ON room_equipment_types(is_active);

CREATE TABLE room_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES fire_station_rooms(id) ON DELETE CASCADE,
    equipment_type_id UUID NOT NULL REFERENCES room_equipment_types(id),
    equipment_name VARCHAR(255) NOT NULL,
    equipment_model VARCHAR(255),
    equipment_serial_number VARCHAR(255),
    equipment_manufacturer VARCHAR(255),
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    condition_status VARCHAR(50) DEFAULT 'Good', -- 'Excellent', 'Good', 'Fair', 'Poor'
    quantity INTEGER DEFAULT 1,
    value_usd DECIMAL(12,2),
    location_within_room VARCHAR(255),
    notes TEXT,
    created_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for equipment
CREATE INDEX idx_room_equipment_room ON room_equipment(room_id);
CREATE INDEX idx_room_equipment_type ON room_equipment(equipment_type_id);
CREATE INDEX idx_room_equipment_active ON room_equipment(is_active);
CREATE INDEX idx_room_equipment_condition ON room_equipment(condition_status);
CREATE INDEX idx_room_equipment_maintenance ON room_equipment(next_maintenance_due);

-- ============================================
-- 3. AUDIT LOGGING TABLES
-- ============================================

CREATE TABLE menu_item_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES user_fire_station_menu_items(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    change_timestamp TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);

CREATE INDEX idx_menu_item_audit_log_menu_item ON menu_item_audit_log(menu_item_id);
CREATE INDEX idx_menu_item_audit_log_timestamp ON menu_item_audit_log(change_timestamp);
CREATE INDEX idx_menu_item_audit_log_staff ON menu_item_audit_log(changed_by_staff_id);

CREATE TABLE room_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES fire_station_rooms(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    change_timestamp TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);

CREATE INDEX idx_room_audit_log_room ON room_audit_log(room_id);
CREATE INDEX idx_room_audit_log_timestamp ON room_audit_log(change_timestamp);

CREATE TABLE equipment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES room_equipment(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by_staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id),
    change_timestamp TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);

CREATE INDEX idx_equipment_audit_log_equipment ON equipment_audit_log(equipment_id);
CREATE INDEX idx_equipment_audit_log_timestamp ON equipment_audit_log(change_timestamp);

-- ============================================
-- 4. AUDIT TRIGGER FUNCTIONS
-- ============================================

-- Function to log changes for menu items
CREATE OR REPLACE FUNCTION log_menu_item_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO menu_item_audit_log (menu_item_id, action, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'CREATE', to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO menu_item_audit_log (menu_item_id, action, old_values, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO menu_item_audit_log (menu_item_id, action, old_values, changed_by_staff_id)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD), OLD.created_by_staff_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to log changes for rooms
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

-- Function to log changes for equipment
CREATE OR REPLACE FUNCTION log_equipment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO equipment_audit_log (equipment_id, action, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'CREATE', to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO equipment_audit_log (equipment_id, action, old_values, new_values, changed_by_staff_id)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by_staff_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO equipment_audit_log (equipment_id, action, old_values, changed_by_staff_id)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD), OLD.created_by_staff_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE AUDIT TRIGGERS
-- ============================================

CREATE TRIGGER trigger_log_menu_item_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_fire_station_menu_items
    FOR EACH ROW EXECUTE FUNCTION log_menu_item_changes();

CREATE TRIGGER trigger_log_room_changes
    AFTER INSERT OR UPDATE OR DELETE ON fire_station_rooms
    FOR EACH ROW EXECUTE FUNCTION log_room_changes();

CREATE TRIGGER trigger_log_equipment_changes
    AFTER INSERT OR UPDATE OR DELETE ON room_equipment
    FOR EACH ROW EXECUTE FUNCTION log_equipment_changes();

-- ============================================
-- 6. EQUIPMENT SUMMARY VIEW
-- ============================================

CREATE VIEW fire_station_equipment_summary AS
SELECT 
    fs.id as fire_station_id,
    fs.fire_station_name,
    fs.department_id,
    fsr.room_name,
    fsr.room_type,
    fsr.area_sqft,
    re.equipment_name,
    re.equipment_model,
    re.quantity,
    re.condition_status,
    re.value_usd,
    ret.equipment_category,
    re.created_at as equipment_added_date
FROM fire_stations_vfh fs
JOIN user_fire_station_menu_items ufsmi ON fs.id = ufsmi.fire_station_id AND ufsmi.is_active = TRUE
JOIN fire_station_rooms fsr ON ufsmi.id = fsr.menu_item_id AND fsr.is_active = TRUE
LEFT JOIN room_equipment re ON fsr.id = re.room_id AND re.is_active = TRUE
LEFT JOIN room_equipment_types ret ON re.equipment_type_id = ret.id
WHERE ufsmi.is_active = TRUE;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_fire_station_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fire_station_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_equipment_types ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR USER_FIRE_STATION_MENU_ITEMS
-- ============================================

-- Helper function to check if user is admin and get their department
CREATE OR REPLACE FUNCTION get_user_department_id(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    dept_id INTEGER;
BEGIN
    -- Try to get department from profiles table first
    SELECT department_id::INTEGER INTO dept_id
    FROM profiles
    WHERE user_id = user_uuid;
    
    -- If no profile department, try to get from staff_basic_info via user lookup
    IF dept_id IS NULL THEN
        SELECT sbi.fire_dept_id INTO dept_id
        FROM staff_basic_info sbi
        WHERE sbi.user_id = user_uuid; -- This might need adjustment based on actual relationship
    END IF;
    
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only admin users can create menu items
CREATE POLICY "Admin users can create menu items" ON user_fire_station_menu_items
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
    AND get_user_department_id(auth.uid()) = user_fire_station_menu_items.department_id
);

-- Users in same department can view menu items
CREATE POLICY "Department users can view menu items" ON user_fire_station_menu_items
FOR SELECT TO authenticated
USING (
    get_user_department_id(auth.uid()) = user_fire_station_menu_items.department_id
);

-- Only admin users can update menu items
CREATE POLICY "Admin users can update menu items" ON user_fire_station_menu_items
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
    AND get_user_department_id(auth.uid()) = user_fire_station_menu_items.department_id
);

-- Only admin users can delete menu items
CREATE POLICY "Admin users can delete menu items" ON user_fire_station_menu_items
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
    AND get_user_department_id(auth.uid()) = user_fire_station_menu_items.department_id
);

-- ============================================
-- RLS POLICIES FOR FIRE_STATION_ROOMS
-- ============================================

-- Users in same department can view rooms
CREATE POLICY "Department users can view rooms" ON fire_station_rooms
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fire_stations_vfh fs
        WHERE fs.id = fire_station_rooms.fire_station_id
        AND fs.department_id = get_user_department_id(auth.uid())
    )
);

-- Admin users can manage rooms
CREATE POLICY "Admin users can manage rooms" ON fire_station_rooms
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
    AND EXISTS (
        SELECT 1 FROM fire_stations_vfh fs
        WHERE fs.id = fire_station_rooms.fire_station_id
        AND fs.department_id = get_user_department_id(auth.uid())
    )
);

-- ============================================
-- RLS POLICIES FOR ROOM_EQUIPMENT
-- ============================================

-- Users in same department can view equipment
CREATE POLICY "Department users can view equipment" ON room_equipment
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fire_station_rooms fsr
        JOIN fire_stations_vfh fs ON fsr.fire_station_id = fs.id
        WHERE fsr.id = room_equipment.room_id
        AND fs.department_id = get_user_department_id(auth.uid())
    )
);

-- Admin users can manage equipment
CREATE POLICY "Admin users can manage equipment" ON room_equipment
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
    AND EXISTS (
        SELECT 1 FROM fire_station_rooms fsr
        JOIN fire_stations_vfh fs ON fsr.fire_station_id = fs.id
        WHERE fsr.id = room_equipment.room_id
        AND fs.department_id = get_user_department_id(auth.uid())
    )
);

-- ============================================
-- RLS POLICIES FOR ROOM_EQUIPMENT_TYPES
-- ============================================

-- All authenticated users can view equipment types
CREATE POLICY "Users can view equipment types" ON room_equipment_types
FOR SELECT TO authenticated
USING (is_active = TRUE);

-- Only admin users can manage equipment types
CREATE POLICY "Admin users can manage equipment types" ON room_equipment_types
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
);

-- ============================================
-- RLS POLICIES FOR AUDIT LOGS
-- ============================================

-- Only admin users can view audit logs
CREATE POLICY "Admin users can view menu audit logs" ON menu_item_audit_log
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
);

-- System can insert audit logs
CREATE POLICY "System can insert menu audit logs" ON menu_item_audit_log
FOR INSERT TO authenticated
WITH CHECK (true);

-- Only admin users can view room audit logs
CREATE POLICY "Admin users can view room audit logs" ON room_audit_log
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
);

-- System can insert room audit logs
CREATE POLICY "System can insert room audit logs" ON room_audit_log
FOR INSERT TO authenticated
WITH CHECK (true);

-- Only admin users can view equipment audit logs
CREATE POLICY "Admin users can view equipment audit logs" ON equipment_audit_log
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('administrator', 'system_admin')
    )
);

-- System can insert equipment audit logs
CREATE POLICY "System can insert equipment audit logs" ON equipment_audit_log
FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================
-- 8. INITIAL DATA - EQUIPMENT TYPES
-- ============================================

INSERT INTO room_equipment_types (equipment_type_name, equipment_category, description) VALUES
('Fire Engine', 'Vehicle', 'Primary response vehicle'),
('Ambulance', 'Vehicle', 'Medical response vehicle'),
('Ladder Truck', 'Vehicle', 'Aerial response vehicle'),
('Rescue Vehicle', 'Vehicle', 'Technical rescue response vehicle'),
('Hose Reel', 'Tools', 'Fire suppression hose system'),
('Fire Extinguisher', 'Safety', 'Portable fire suppression'),
('Breathing Apparatus', 'Safety', 'Respiratory protection equipment'),
('Communication Radio', 'Communication', 'Emergency communication device'),
('First Aid Kit', 'Medical', 'Emergency medical supplies'),
('Rescue Tool', 'Tools', 'Vehicle/structural rescue equipment'),
('Generator', 'Tools', 'Emergency power source'),
('Portable Pump', 'Tools', 'Water supply pump'),
('Cutting Equipment', 'Tools', 'Hydraulic rescue tools'),
('Lighting Equipment', 'Tools', 'Emergency scene lighting'),
('Hazmat Suit', 'Safety', 'Chemical protection equipment'),
('Defibrillator', 'Medical', 'Emergency cardiac care device'),
('Oxygen Tank', 'Medical', 'Emergency oxygen supply'),
('Stretcher', 'Medical', 'Patient transport equipment'),
('Fire Blanket', 'Safety', 'Emergency fire suppression blanket'),
('Emergency Beacon', 'Communication', 'Location tracking device');

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to get all equipment summary for a fire station
CREATE OR REPLACE FUNCTION get_fire_station_equipment_summary(f_station_id INTEGER)
RETURNS TABLE (
    room_name VARCHAR(255),
    room_type VARCHAR(100),
    equipment_count BIGINT,
    total_value DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fsr.room_name,
        fsr.room_type,
        COUNT(re.id) as equipment_count,
        COALESCE(SUM(re.value_usd * re.quantity), 0) as total_value
    FROM fire_station_rooms fsr
    LEFT JOIN room_equipment re ON fsr.id = re.room_id AND re.is_active = TRUE
    WHERE fsr.fire_station_id = f_station_id 
    AND fsr.is_active = TRUE
    GROUP BY fsr.room_name, fsr.room_type
    ORDER BY fsr.room_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get equipment due for maintenance
CREATE OR REPLACE FUNCTION get_equipment_due_for_maintenance(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    equipment_id UUID,
    equipment_name VARCHAR(255),
    fire_station_name VARCHAR(255),
    room_name VARCHAR(255),
    next_maintenance_due DATE,
    days_until_due INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        re.id,
        re.equipment_name,
        fs.fire_station_name,
        fsr.room_name,
        re.next_maintenance_due,
        (re.next_maintenance_due - CURRENT_DATE) as days_until_due
    FROM room_equipment re
    JOIN fire_station_rooms fsr ON re.room_id = fsr.id
    JOIN user_fire_station_menu_items ufsmi ON fsr.menu_item_id = ufsmi.id
    JOIN fire_stations_vfh fs ON ufsmi.fire_station_id = fs.id
    WHERE re.is_active = TRUE
    AND re.next_maintenance_due IS NOT NULL
    AND re.next_maintenance_due <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND re.next_maintenance_due >= CURRENT_DATE
    ORDER BY re.next_maintenance_due;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_fire_station_menu_items IS 'Stores user-added menu items for fire stations';
COMMENT ON TABLE fire_station_rooms IS 'Stores rooms within fire stations for equipment organization';
COMMENT ON TABLE room_equipment IS 'Tracks equipment items within each room';
COMMENT ON TABLE room_equipment_types IS 'Standard equipment categories that can be assigned to rooms';
COMMENT ON TABLE menu_item_audit_log IS 'Tracks all changes to menu items for compliance';
COMMENT ON TABLE room_audit_log IS 'Tracks all changes to rooms for compliance';
COMMENT ON TABLE equipment_audit_log IS 'Tracks all changes to equipment for compliance';
COMMENT ON VIEW fire_station_equipment_summary IS 'Overview of all equipment per fire station';

COMMENT ON FUNCTION get_fire_station_equipment_summary(INTEGER) IS 'Get equipment summary for a specific fire station';
COMMENT ON FUNCTION get_equipment_due_for_maintenance(INTEGER) IS 'Get equipment items due for maintenance within specified days';
COMMENT ON FUNCTION get_user_department_id(UUID) IS 'Helper function to get user department ID for RLS policies';

-- Migration completed successfully