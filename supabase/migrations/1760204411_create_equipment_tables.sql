-- Create Equipment Types table
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Model Makes table
CREATE TABLE IF NOT EXISTS model_makes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Location Departments table
CREATE TABLE IF NOT EXISTS location_departments (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_name TEXT NOT NULL,
    equipment_type TEXT,
    model_make TEXT,
    serial_number TEXT,
    manufacturer TEXT,
    purchase_date DATE,
    warranty_expiry_date DATE,
    condition_status TEXT,
    location_department TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment(equipment_name);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);

-- Enable RLS
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for dropdown tables (read-only for authenticated users)
CREATE POLICY "Allow authenticated read access to equipment_types"
ON equipment_types FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read access to model_makes"
ON model_makes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read access to manufacturers"
ON manufacturers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read access to location_departments"
ON location_departments FOR SELECT
TO authenticated
USING (true);

-- Create policies for equipment table (full access for authenticated users)
CREATE POLICY "Allow authenticated read access to equipment"
ON equipment FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert access to equipment"
ON equipment FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to equipment"
ON equipment FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete access to equipment"
ON equipment FOR DELETE
TO authenticated
USING (true);

-- Insert sample data for dropdown tables
INSERT INTO equipment_types (name) VALUES
    ('Fire Extinguisher'),
    ('Fire Hose'),
    ('Breathing Apparatus'),
    ('Rescue Tool'),
    ('Communication Device'),
    ('Safety Gear'),
    ('Medical Equipment'),
    ('Ladder'),
    ('Pump'),
    ('Generator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO model_makes (name) VALUES
    ('Amerex'),
    ('Ansul'),
    ('Kidde'),
    ('Draeger'),
    ('MSA'),
    ('Scott Safety'),
    ('Holmatro'),
    ('Weber Rescue'),
    ('Motorola'),
    ('Zoll')
ON CONFLICT (name) DO NOTHING;

INSERT INTO manufacturers (name) VALUES
    ('3M'),
    ('Honeywell'),
    ('DuPont'),
    ('Ansul (Tyco)'),
    ('Kidde-Fenwal'),
    ('Draeger Safety'),
    ('MSA Safety'),
    ('Scott Safety (Tyco)'),
    ('Holmatro Rescue Equipment'),
    ('Weber Rescue Systems')
ON CONFLICT (name) DO NOTHING;

INSERT INTO location_departments (name) VALUES
    ('Fire Station 1'),
    ('Fire Station 2'),
    ('Fire Station 3'),
    ('Central Storage'),
    ('Maintenance Workshop'),
    ('Training Facility'),
    ('Emergency Response Unit'),
    ('Hazmat Unit'),
    ('Rescue Unit'),
    ('Administration')
ON CONFLICT (name) DO NOTHING;
