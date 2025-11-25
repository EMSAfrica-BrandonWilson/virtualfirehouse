-- Migration: Drop and recreate vehicle station assignments table
-- Created at: 1763047000
-- Purpose: Start fresh with a simplified, more robust table structure

-- Drop existing table and all related objects
DROP TABLE IF EXISTS public.vehicle_station_assignments CASCADE;
DROP TABLE IF EXISTS public.vehicle_station_assignment_audit_log CASCADE;

-- Create new simplified vehicle assignments table
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
    id BIGSERIAL PRIMARY KEY,
    assignment_date DATE NOT NULL,
    vehicle_id INTEGER NOT NULL,
    call_sign VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'In Service',
    readiness VARCHAR(50) NOT NULL DEFAULT 'Operational',
    station_assignment VARCHAR(100) NOT NULL DEFAULT 'Main Fire Station',
    crew_members TEXT DEFAULT '',
    last_check_time VARCHAR(10) DEFAULT '08:00:00',
    is_workshop BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure only one record per vehicle per date
CREATE UNIQUE INDEX IF NOT EXISTS vehicle_assignments_unique_per_date_vehicle 
ON public.vehicle_assignments (assignment_date, vehicle_id);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS vehicle_assignments_date_idx ON public.vehicle_assignments(assignment_date);
CREATE INDEX IF NOT EXISTS vehicle_assignments_vehicle_id_idx ON public.vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_assignments_status_idx ON public.vehicle_assignments(status);
CREATE INDEX IF NOT EXISTS vehicle_assignments_readiness_idx ON public.vehicle_assignments(readiness);
CREATE INDEX IF NOT EXISTS vehicle_assignments_call_sign_idx ON public.vehicle_assignments(call_sign);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_assignments_updated_at_trigger
    BEFORE UPDATE ON public.vehicle_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_vehicle_assignments_updated_at();

-- Enable RLS
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view vehicle assignments" 
ON public.vehicle_assignments FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert vehicle assignments" 
ON public.vehicle_assignments FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update vehicle assignments" 
ON public.vehicle_assignments FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.vehicle_assignments TO anon, authenticated;
GRANT INSERT ON public.vehicle_assignments TO anon, authenticated;
GRANT UPDATE ON public.vehicle_assignments TO anon, authenticated;
GRANT DELETE ON public.vehicle_assignments TO anon, authenticated;

-- Create a simple audit log table
CREATE TABLE IF NOT EXISTS public.vehicle_assignment_changes (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT REFERENCES public.vehicle_assignments(id) ON DELETE CASCADE,
    change_type VARCHAR(20) NOT NULL, -- 'created', 'updated', 'deleted'
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB
);

-- Grant permissions for audit log
GRANT SELECT ON public.vehicle_assignment_changes TO anon, authenticated;
GRANT INSERT ON public.vehicle_assignment_changes TO anon, authenticated;