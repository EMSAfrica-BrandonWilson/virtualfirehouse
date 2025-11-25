-- Migration: create_vehicle_station_assignments
-- Created at: 1761250000
-- Purpose: Create vehicle station assignments table with change tracking

-- Create vehicle station assignments table
CREATE TABLE IF NOT EXISTS public.vehicle_station_assignments (
    id SERIAL PRIMARY KEY,
    assignment_date DATE NOT NULL,
    vehicle_id INTEGER REFERENCES public.vehicles(id) ON DELETE CASCADE,
    call_sign VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('In Service', 'Out of Service')),
    readiness VARCHAR(50) NOT NULL CHECK (readiness IN ('Operational', 'On Standby', 'At Station', 'In Workshop')),
    station_assignment VARCHAR(100) NOT NULL,
    crew_members TEXT,
    last_check_time TIME,
    is_workshop BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure only one record per vehicle per day
CREATE UNIQUE INDEX IF NOT EXISTS vehicle_station_assignments_unique_per_date_vehicle 
ON public.vehicle_station_assignments (assignment_date, vehicle_id);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS vehicle_station_assignments_date_idx ON public.vehicle_station_assignments(assignment_date);
CREATE INDEX IF NOT EXISTS vehicle_station_assignments_vehicle_id_idx ON public.vehicle_station_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_station_assignments_status_idx ON public.vehicle_station_assignments(status);
CREATE INDEX IF NOT EXISTS vehicle_station_assignments_readiness_idx ON public.vehicle_station_assignments(readiness);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_station_assignments_updated_at 
    BEFORE UPDATE ON public.vehicle_station_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.vehicle_station_assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view assignments
CREATE POLICY "Authenticated users can view vehicle station assignments" 
ON public.vehicle_station_assignments FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert assignments
CREATE POLICY "Authenticated users can insert vehicle station assignments" 
ON public.vehicle_station_assignments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update assignments
CREATE POLICY "Authenticated users can update vehicle station assignments" 
ON public.vehicle_station_assignments FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policy for system admins to delete assignments
CREATE POLICY "System admins can delete vehicle station assignments" 
ON public.vehicle_station_assignments FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role_name = 'system_admin'
    )
);