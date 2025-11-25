-- Migration: Fix RLS policies for vehicle_assignments table - Allow all authenticated operations
-- Created at: 1763049600
-- Purpose: Ensure proper RLS policies for authenticated users with correct UUID handling

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can update vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete vehicle assignments" ON public.vehicle_assignments;

-- Create more permissive policies for authenticated users
-- These policies allow any authenticated user to perform operations
CREATE POLICY "Allow authenticated users to view all assignments" 
ON public.vehicle_assignments FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert assignments" 
ON public.vehicle_assignments FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update all assignments" 
ON public.vehicle_assignments FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete assignments" 
ON public.vehicle_assignments FOR DELETE 
TO authenticated
USING (true);

-- Ensure proper permissions are granted
GRANT ALL ON public.vehicle_assignments TO authenticated;
GRANT SELECT ON public.vehicle_assignments TO anon;

-- Grant permissions on the sequence for auto-incrementing IDs
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO anon;