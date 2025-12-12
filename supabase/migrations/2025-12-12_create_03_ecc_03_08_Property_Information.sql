CREATE TABLE IF NOT EXISTS "03_ecc_03_08_Property_Information" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
  properties JSONB NOT NULL DEFAULT '[]'::jsonb,
  legal_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  type_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_info_incident_number
  ON "03_ecc_03_08_Property_Information" (incident_number);

ALTER TABLE "03_ecc_03_08_Property_Information" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_info_select_authenticated" ON "03_ecc_03_08_Property_Information";
DROP POLICY IF EXISTS "property_info_insert_authenticated" ON "03_ecc_03_08_Property_Information";
DROP POLICY IF EXISTS "property_info_update_authenticated" ON "03_ecc_03_08_Property_Information";

CREATE POLICY "property_info_select_authenticated"
ON "03_ecc_03_08_Property_Information"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "property_info_insert_authenticated"
ON "03_ecc_03_08_Property_Information"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "property_info_update_authenticated"
ON "03_ecc_03_08_Property_Information"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
