-- Migration: Create Department Status Table
-- Created: 2025-11-08
-- Description: Creates the department_status table for managing operational status dropdown options

-- Create department_status table
CREATE TABLE IF NOT EXISTS public.department_status (
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
CREATE INDEX idx_department_status_name ON public.department_status(name);
CREATE INDEX idx_department_status_display_name ON public.department_status(display_name);
CREATE INDEX idx_department_status_active ON public.department_status(is_active);
CREATE INDEX idx_department_status_created_at ON public.department_status(created_at);

-- Insert default department status options
INSERT INTO public.department_status (name, display_name, description, is_active) VALUES
('active', 'Active', 'Department is fully operational and active', TRUE),
('inactive', 'Inactive', 'Department is temporarily inactive', TRUE),
('under_construction', 'Under Construction', 'Department is being built or renovated', TRUE),
('planning', 'Planning', 'Department is in planning phase', TRUE),
('training', 'Training', 'Department is in training status', TRUE),
('maintenance', 'Maintenance', 'Department is under maintenance', TRUE),
('emergency_only', 'Emergency Only', 'Department operates only during emergencies', TRUE),
('seasonal', 'Seasonal', 'Department operates seasonally', TRUE),
('volunteer', 'Volunteer', 'Department operates with volunteer staff', TRUE),
('private', 'Private', 'Department is privately operated', TRUE),
('municipal', 'Municipal', 'Department is municipally operated', TRUE),
('federal', 'Federal', 'Department is federally operated', TRUE),
('state', 'State', 'Department is state operated', TRUE),
('county', 'County', 'Department is county operated', TRUE),
('other', 'Other', 'Other operational status', TRUE);

-- Add table comment
COMMENT ON TABLE public.department_status IS 'Stores operational status dropdown options for department registration forms';