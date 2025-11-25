-- Create incident_types table for managing EDOB incident type options
CREATE TABLE IF NOT EXISTS incident_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_incident_types_active ON incident_types(is_active);
CREATE INDEX IF NOT EXISTS idx_incident_types_display_name ON incident_types(display_name);

-- Insert default incident types
INSERT INTO incident_types (name, display_name, description) VALUES 
('emergency', 'Emergency', 'Critical emergency situations requiring immediate response'),
('incident', 'Incident', 'General incidents that require attention but are not emergencies'),
('maintenance', 'Maintenance', 'Scheduled or unscheduled maintenance activities'),
('training', 'Training', 'Training exercises and activities'),
('routine', 'Routine', 'Routine operations and daily activities'),
('other', 'Other', 'Other types of occurrences not covered by standard categories')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incident_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_incident_types_updated_at
    BEFORE UPDATE ON incident_types
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_types_updated_at();