-- Enable RLS
ALTER TABLE "public"."03_ecc_01_edob_02_incident_types" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON "public"."03_ecc_01_edob_02_incident_types"
FOR SELECT
TO public
USING (true);
