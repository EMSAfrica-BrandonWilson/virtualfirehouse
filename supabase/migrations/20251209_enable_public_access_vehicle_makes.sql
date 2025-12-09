
-- Enable RLS on the table (ensure it's on)
ALTER TABLE "public"."02_admin_register_fd7_vehicle_makes" ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (Read access)
CREATE POLICY "Enable read access for all users" ON "public"."02_admin_register_fd7_vehicle_makes"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Policy for INSERT (Create access)
CREATE POLICY "Enable insert access for all users" ON "public"."02_admin_register_fd7_vehicle_makes"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Policy for UPDATE (Update access)
CREATE POLICY "Enable update access for all users" ON "public"."02_admin_register_fd7_vehicle_makes"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy for DELETE (Delete access)
CREATE POLICY "Enable delete access for all users" ON "public"."02_admin_register_fd7_vehicle_makes"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
