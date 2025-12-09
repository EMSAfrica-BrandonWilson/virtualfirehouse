
-- Enable Row Level Security
ALTER TABLE "public"."02_admin_register_fd3_stations" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."02_admin_register_fd3_stations";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."02_admin_register_fd3_stations";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."02_admin_register_fd3_stations";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."02_admin_register_fd3_stations";

-- Create policy to allow SELECT for everyone (authenticated and anonymous)
CREATE POLICY "Enable read access for all users" ON "public"."02_admin_register_fd3_stations"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Create policy to allow INSERT for everyone (authenticated and anonymous)
CREATE POLICY "Enable insert access for all users" ON "public"."02_admin_register_fd3_stations"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow UPDATE for everyone (authenticated and anonymous)
CREATE POLICY "Enable update access for all users" ON "public"."02_admin_register_fd3_stations"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create policy to allow DELETE for everyone (authenticated and anonymous)
CREATE POLICY "Enable delete access for all users" ON "public"."02_admin_register_fd3_stations"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
