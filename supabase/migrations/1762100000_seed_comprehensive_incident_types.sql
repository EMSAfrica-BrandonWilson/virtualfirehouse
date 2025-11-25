-- Seed comprehensive incident types for VirtualFireHouse
-- This migration adds the specific incident types users expect to see

-- Clear existing generic incident types to avoid confusion
DELETE FROM incident_types WHERE name IN ('emergency', 'incident', 'maintenance', 'training', 'routine', 'other');

-- Insert emergency-related incident types
INSERT INTO incident_types (name, display_name, description) VALUES 
('emergency', 'Fire Incident', 'Fires, explosions, and fire-related emergencies'),
('emergency', 'Hazmat', 'Hazardous material incidents and chemical spills'),
('emergency', 'RTA', 'Road Traffic Accidents and vehicle collisions'),
('emergency', 'Medical Emergency', 'Medical incidents requiring emergency response'),
('emergency', 'Structural Collapse', 'Building or structural collapse incidents'),
('emergency', 'Aircraft Emergency', 'Aviation-related emergencies and crashes'),

-- Insert maintenance-related incident types
('maintenance', 'Buildings', 'Building maintenance and facility issues'),
('maintenance', 'Equipment', 'Equipment failure, malfunction, and maintenance'),
('maintenance', 'HVAC', 'Heating, ventilation, and air conditioning systems'),
('maintenance', 'Vehicles', 'Vehicle maintenance and fleet issues'),
('maintenance', 'Fire Systems', 'Fire suppression and detection systems'),
('maintenance', 'Communication Systems', 'Radio, phone, and communication equipment'),

-- Insert operational incident types
('operational', 'Drill', 'Emergency response training drills and exercises'),
('operational', 'Inspection', 'Safety inspections and compliance checks'),
('operational', 'Training Exercise', 'Non-emergency training and development activities'),
('operational', 'Equipment Testing', 'Testing and calibration of emergency equipment'),
('operational', 'Preparedness', 'Preparedness activities and readiness assessments'),

-- Insert other incident types
('other', 'Administrative', 'Administrative tasks and paperwork'),
('other', 'Utility Issue', 'Utility failures (power, water, gas)'),
('other', 'Environmental', 'Environmental incidents and spill control'),
('other', 'Security', 'Security incidents and breaches'),
('other', 'Weather Related', 'Weather-related incidents and storm damage'),
('other', 'Public Safety', 'Public safety concerns and community assistance')

ON CONFLICT (display_name) DO NOTHING;