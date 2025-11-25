-- Migration: Temporarily disable RLS completely for vehicle_assignments
-- Created at: 1763050700
-- Purpose: Disable RLS completely to test functionality

-- Completely disable RLS
ALTER TABLE public.vehicle_assignments DISABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Allow anonymous users to view assignments" ON public.vehicle_assignments;

-- Ensure all permissions are granted to both roles
GRANT ALL ON public.vehicle_assignments TO anon, authenticated;
GRANT ALL ON SEQUENCE public.vehicle_assignments_id_seq TO anon, authenticated;