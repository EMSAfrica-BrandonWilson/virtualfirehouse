-- Migration: Temporarily disable RLS for vehicle_assignments table for testing
-- Created at: 1763049700
-- Purpose: Disable RLS temporarily to test basic functionality

-- Temporarily disable RLS to test basic functionality
ALTER TABLE public.vehicle_assignments DISABLE ROW LEVEL SECURITY;

-- Ensure all permissions are granted
GRANT ALL ON public.vehicle_assignments TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.vehicle_assignments_id_seq TO anon, authenticated;