-- Enable RLS on the table (already enabled, but good practice to include)
ALTER TABLE "public"."03_ecc_02_duty_roster_01_station_assignments" ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (public access - or authenticated if you prefer, but public is often easier for read-only views)
-- If this data is sensitive, change TO public to TO authenticated
CREATE POLICY "Enable read access for all users"
ON "public"."03_ecc_02_duty_roster_01_station_assignments"
FOR SELECT
TO public
USING (true);

-- Policy for INSERT (authenticated users)
CREATE POLICY "Enable insert access for authenticated users"
ON "public"."03_ecc_02_duty_roster_01_station_assignments"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE (authenticated users)
CREATE POLICY "Enable update access for authenticated users"
ON "public"."03_ecc_02_duty_roster_01_station_assignments"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE (authenticated users)
CREATE POLICY "Enable delete access for authenticated users"
ON "public"."03_ecc_02_duty_roster_01_station_assignments"
FOR DELETE
TO authenticated
USING (true);
