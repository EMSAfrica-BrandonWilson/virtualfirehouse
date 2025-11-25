-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ranks table
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    level INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create emergency_contact_relationships table
CREATE TABLE IF NOT EXISTS emergency_contact_relationships (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employment_status table
CREATE TABLE IF NOT EXISTS employment_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default positions
INSERT INTO positions (name, description) VALUES 
('Firefighter', 'Entry level firefighter position'),
('Captain', 'Fire station captain'),
('Lieutenant', 'Shift supervisor'),
('Chief', 'Fire department chief'),
('Engineer', 'Fire truck engineer/driver')
ON CONFLICT (name) DO NOTHING;

-- Insert some default ranks
INSERT INTO ranks (name, code, level, description) VALUES 
('Recruit', 'REC', 1, 'New recruit in training'),
('Firefighter I', 'FF1', 2, 'Basic certified firefighter'),
('Firefighter II', 'FF2', 3, 'Advanced firefighter certification'),
('Lieutenant', 'LT', 4, 'Company officer'),
('Captain', 'CPT', 5, 'Station commander'),
('Battalion Chief', 'BC', 6, 'Battalion level command'),
('Deputy Chief', 'DC', 7, 'Deputy department command'),
('Fire Chief', 'FC', 8, 'Department commander')
ON CONFLICT (name) DO NOTHING;

-- Insert default emergency contact relationships
INSERT INTO emergency_contact_relationships (name, description) VALUES 
('Spouse', 'Married partner'),
('Parent', 'Mother or father'),
('Child', 'Son or daughter'),
('Sibling', 'Brother or sister'),
('Friend', 'Close friend'),
('Other Relative', 'Extended family member'),
('Colleague', 'Work colleague')
ON CONFLICT (name) DO NOTHING;

-- Insert default employment status options
INSERT INTO employment_status (name, description) VALUES 
('Full-time', 'Regular full-time employee'),
('Part-time', 'Part-time employee'),
('Volunteer', 'Volunteer firefighter'),
('Temporary', 'Temporary employee'),
('Contract', 'Contract worker'),
('Probationary', 'Employee on probation'),
('Retired', 'Retired employee'),
('Inactive', 'Inactive status')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contact_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON positions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ranks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON emergency_contact_relationships FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON employment_status FOR SELECT USING (true);

-- Create policies for authenticated insert/update/delete
CREATE POLICY "Enable insert for authenticated users" ON positions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON positions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON positions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON ranks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON ranks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON ranks FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON emergency_contact_relationships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON emergency_contact_relationships FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON emergency_contact_relationships FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON employment_status FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON employment_status FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON employment_status FOR DELETE USING (auth.role() = 'authenticated');
