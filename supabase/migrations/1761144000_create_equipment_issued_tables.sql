-- Create uniform_items table
CREATE TABLE IF NOT EXISTS uniform_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ppe_items table
CREATE TABLE IF NOT EXISTS ppe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create staff_equipment_issued table
CREATE TABLE IF NOT EXISTS staff_equipment_issued (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id INTEGER NOT NULL REFERENCES staff_basic_info(staff_id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('uniform', 'ppe')),
    item_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    condition VARCHAR(100),
    description TEXT,
    issue_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, item_type, item_id)
);

-- Insert default uniform items (alphabetically ordered)
INSERT INTO uniform_items (name, description) VALUES 
('Belt', 'Uniform belt'),
('Jacket', 'Uniform jacket'),
('Jersey', 'Uniform jersey/pullover'),
('Pants', 'Uniform pants/trousers'),
('Shirts', 'Uniform shirts'),
('Shoes', 'Uniform shoes'),
('Socks', 'Uniform socks'),
('T-Shirts', 'Uniform t-shirts'),
('Tie', 'Uniform tie')
ON CONFLICT (name) DO NOTHING;

-- Insert default PPE items (alphabetically ordered)
INSERT INTO ppe_items (name, description) VALUES 
('Bunker Pants', 'Fire bunker pants'),
('Bunker Tunic', 'Fire bunker tunic/jacket'),
('Face Mask', 'Personalised SCBA face mask'),
('Fire Boots', 'Fire fighting boots'),
('Fire Gloves', 'Fire fighting gloves'),
('Fire Helmet', 'Fire fighting helmet'),
('Flashhood', 'Fire resistant hood'),
('Flashlight', 'Personal flashlight'),
('Hearing Protection', 'Hearing protection equipment'),
('Safety Shoes', 'Safety shoes')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE uniform_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_equipment_issued ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON uniform_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ppe_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON staff_equipment_issued FOR SELECT USING (true);

-- Create policies for authenticated insert/update/delete
CREATE POLICY "Enable insert for authenticated users" ON uniform_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON uniform_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON uniform_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON ppe_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON ppe_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON ppe_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON staff_equipment_issued FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON staff_equipment_issued FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON staff_equipment_issued FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_staff_equipment_issued_staff_id ON staff_equipment_issued(staff_id);
CREATE INDEX idx_staff_equipment_issued_item_type ON staff_equipment_issued(item_type);
CREATE INDEX idx_staff_equipment_issued_item_id ON staff_equipment_issued(item_id);
