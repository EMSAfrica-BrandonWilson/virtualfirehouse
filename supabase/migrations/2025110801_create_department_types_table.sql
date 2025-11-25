-- Migration: Create Department Types Table
-- Created: 2025-11-08
-- Description: Creates the department_types table for managing department type dropdown options

-- Create department_types table
CREATE TABLE IF NOT EXISTS public.department_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_department_types_name ON public.department_types(name);
CREATE INDEX idx_department_types_display_name ON public.department_types(display_name);
CREATE INDEX idx_department_types_active ON public.department_types(is_active);
CREATE INDEX idx_department_types_created_at ON public.department_types(created_at);

-- Insert default department types
INSERT INTO public.department_types (name, display_name, description, is_active) VALUES
('fire_rescue', 'Fire & Rescue', 'Primary fire and rescue services', TRUE),
('ems', 'Emergency Medical Services', 'Emergency medical response and transport', TRUE),
('hazmat', 'Hazmat Response', 'Hazardous materials response team', TRUE),
('technical_rescue', 'Technical Rescue', 'Specialized technical rescue operations', TRUE),
('wildland', 'Wildland Firefighting', 'Wildland and forest fire suppression', TRUE),
('marine', 'Marine Rescue', 'Water-based rescue operations', TRUE),
('search_rescue', 'Search & Rescue', 'Search and rescue operations', TRUE),
('airport', 'Airport Fire & Rescue', 'Aircraft rescue and firefighting services', TRUE),
('industrial', 'Industrial Fire Brigade', 'Industrial facility fire protection', TRUE),
('volunteer', 'Volunteer Fire Department', 'Volunteer-based fire department', TRUE),
('combination', 'Combination Department', 'Combination career and volunteer department', TRUE),
('private', 'Private Fire Service', 'Private contract fire services', TRUE),
('military', 'Military Fire & Emergency', 'Military base fire and emergency services', TRUE),
('other', 'Other', 'Other emergency service department type', TRUE);

-- Add table comment
COMMENT ON TABLE public.department_types IS 'Stores department type dropdown options for department registration forms';