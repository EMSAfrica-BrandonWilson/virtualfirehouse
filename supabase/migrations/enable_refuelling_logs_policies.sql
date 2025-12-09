-- Enable RLS on the table (ensure it is on)
ALTER TABLE "public"."03_ecc_01_edob_05_refuelling_logs" ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Enable read access for authenticated users"
ON "public"."03_ecc_01_edob_05_refuelling_logs"
FOR SELECT
TO authenticated
USING (true);

-- Policy for INSERT
CREATE POLICY "Enable insert access for authenticated users"
ON "public"."03_ecc_01_edob_05_refuelling_logs"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Enable update access for authenticated users"
ON "public"."03_ecc_01_edob_05_refuelling_logs"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE
CREATE POLICY "Enable delete access for authenticated users"
ON "public"."03_ecc_01_edob_05_refuelling_logs"
FOR DELETE
TO authenticated
USING (true);
