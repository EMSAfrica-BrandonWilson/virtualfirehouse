-- Migration: Add RLS policies for daily_vehicle_records table
-- This migration adds Row Level Security policies to allow proper access to the daily_vehicle_records table

-- Grant SELECT permission to anon role for read operations
GRANT SELECT ON daily_vehicle_records TO anon;

-- Grant ALL permissions to authenticated role for full CRUD operations
GRANT ALL ON daily_vehicle_records TO authenticated;

-- Create RLS policy for SELECT operations (allow all users to read)
CREATE POLICY "Allow read access to all users" ON daily_vehicle_records
    FOR SELECT
    USING (true);

-- Create RLS policy for INSERT operations (allow authenticated users to create)
CREATE POLICY "Allow insert for authenticated users" ON daily_vehicle_records
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policy for UPDATE operations (allow authenticated users to update)
CREATE POLICY "Allow update for authenticated users" ON daily_vehicle_records
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policy for DELETE operations (allow authenticated users to delete)
CREATE POLICY "Allow delete for authenticated users" ON daily_vehicle_records
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'daily_vehicle_records' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;