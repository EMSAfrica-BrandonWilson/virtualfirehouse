-- Migration: Fix RLS policies for vehicle_assignments table
-- Created at: 1763049500
-- Purpose: Ensure proper RLS policies for authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can update vehicle assignments" ON public.vehicle_assignments;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all vehicle assignments" 
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

CREATE POLICY "Authenticated users can delete vehicle assignments" 
ON public.vehicle_assignments FOR DELETE 
TO authenticated
USING (true);

-- Ensure proper permissions are granted
GRANT ALL ON public.vehicle_assignments TO authenticated;
GRANT SELECT ON public.vehicle_assignments TO anon;

-- Also grant permissions on the sequence for auto-incrementing IDs
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO anon;