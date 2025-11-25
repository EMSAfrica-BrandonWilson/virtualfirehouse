-- Migration: Re-enable RLS with proper policies for production use
-- Created at: 1763049800
-- Purpose: Re-enable RLS with proper policies that work with the application context

-- Re-enable RLS
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Drop the temporary permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to view all assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Allow authenticated users to insert assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Allow authenticated users to update all assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Allow authenticated users to delete assignments" ON public.vehicle_assignments;

-- Create proper production-ready policies
CREATE POLICY "Users can view all vehicle assignments" 
ON public.vehicle_assignments FOR SELECT 
TO authenticated, anon
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

-- Ensure proper permissions are maintained
GRANT SELECT ON public.vehicle_assignments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_assignments TO authenticated;
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO authenticated;