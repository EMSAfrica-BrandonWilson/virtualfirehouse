-- Migration: create_vehicle_dropdown_tables
-- Created at: 1759875182

-- Create vehicle dropdown tables
CREATE TABLE call_signs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE TABLE vehicle_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE TABLE vehicle_makes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Insert sample call signs
INSERT INTO call_signs (name, active) VALUES 
('ARFF-001', true),
('ARFF-002', true),
('ARFF-003', true),
('RESCUE-01', true),
('RESCUE-02', true),
('COMMAND-1', true),
('FOAM-01', true),
('WATER-01', true);

-- Insert sample vehicle types
INSERT INTO vehicle_types (name, active) VALUES 
('Aircraft Rescue & Firefighting Vehicle', true),
('Fire Engine', true),
('Ladder Truck', true),
('Rescue Vehicle', true),
('Command Vehicle', true),
('Support Vehicle', true),
('Foam Tender', true),
('Water Tender', true);

-- Insert sample vehicle makes
INSERT INTO vehicle_makes (name, active) VALUES 
('Oshkosh', true),
('Rosenbauer', true),
('E-ONE', true),
('Pierce', true),
('Scania', true),
('Mercedes-Benz', true),
('Volvo', true),
('MAN', true);;