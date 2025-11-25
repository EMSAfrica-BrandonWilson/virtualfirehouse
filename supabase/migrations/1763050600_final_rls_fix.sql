-- Migration: Fix RLS policies for vehicle_assignments - Allow all operations for authenticated users
-- Created at: 1763050600
-- Purpose: Ensure authenticated users can perform all operations without restrictions

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can update vehicle assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete vehicle assignments" ON public.vehicle_assignments;

-- Create a single permissive policy for all operations
CREATE POLICY "Allow all operations for authenticated users" 
ON public.vehicle_assignments FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a policy for anonymous users to read data
CREATE POLICY "Allow anonymous users to view assignments" 
ON public.vehicle_assignments FOR SELECT 
TO anon
USING (true);

-- Ensure comprehensive permissions
GRANT ALL ON public.vehicle_assignments TO authenticated;
GRANT SELECT ON public.vehicle_assignments TO anon;
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO authenticated;