-- Enable RLS
ALTER TABLE "02_admin_shift_system_definitions" ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous and authenticated users to select
CREATE POLICY "Enable read access for all users" ON "02_admin_shift_system_definitions"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Create policy for anonymous and authenticated users to insert
CREATE POLICY "Enable insert access for all users" ON "02_admin_shift_system_definitions"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for anonymous and authenticated users to update
CREATE POLICY "Enable update access for all users" ON "02_admin_shift_system_definitions"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create policy for anonymous and authenticated users to delete
CREATE POLICY "Enable delete access for all users" ON "02_admin_shift_system_definitions"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
