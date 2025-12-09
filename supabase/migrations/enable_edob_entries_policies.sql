-- Enable RLS on the table
ALTER TABLE "public"."03_ecc_01_edob_01_entries" ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (public access)
CREATE POLICY "Enable read access for all users"
ON "public"."03_ecc_01_edob_01_entries"
FOR SELECT
TO public
USING (true);

-- Policy for INSERT (authenticated users)
CREATE POLICY "Enable insert access for authenticated users"
ON "public"."03_ecc_01_edob_01_entries"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE (authenticated users)
CREATE POLICY "Enable update access for authenticated users"
ON "public"."03_ecc_01_edob_01_entries"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE (authenticated users)
CREATE POLICY "Enable delete access for authenticated users"
ON "public"."03_ecc_01_edob_01_entries"
FOR DELETE
TO authenticated
USING (true);
