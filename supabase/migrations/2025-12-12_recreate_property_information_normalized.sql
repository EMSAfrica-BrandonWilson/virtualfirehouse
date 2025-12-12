DROP POLICY IF EXISTS property_info_select_authenticated ON "03_ecc_03_08_Property_Information";
DROP POLICY IF EXISTS property_info_insert_authenticated ON "03_ecc_03_08_Property_Information";
DROP POLICY IF EXISTS property_info_update_authenticated ON "03_ecc_03_08_Property_Information";
DROP TABLE IF EXISTS "03_ecc_03_08_Property_Information" CASCADE;

CREATE TABLE IF NOT EXISTS "03_ecc_03_08_Property_Information" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
  owner_name TEXT,
  owner_contact TEXT,
  occupant_name TEXT,
  occupant_contact TEXT,
  legal_description TEXT,
  property_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_info_incident_number
  ON "03_ecc_03_08_Property_Information" (incident_number);

ALTER TABLE "03_ecc_03_08_Property_Information" ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_info_select_authenticated
  ON "03_ecc_03_08_Property_Information"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY property_info_insert_authenticated
  ON "03_ecc_03_08_Property_Information"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY property_info_update_authenticated
  ON "03_ecc_03_08_Property_Information"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "03_ecc_03_08_Property_Information_Items" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_08_Property_Information"(incident_number) ON DELETE CASCADE,
  owner_name TEXT,
  owner_contact TEXT,
  occupant_name TEXT,
  occupant_contact TEXT,
  legal_description TEXT,
  property_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_items_incident_number
  ON "03_ecc_03_08_Property_Information_Items" (incident_number);

ALTER TABLE "03_ecc_03_08_Property_Information_Items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_items_select_authenticated
  ON "03_ecc_03_08_Property_Information_Items"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY property_items_insert_authenticated
  ON "03_ecc_03_08_Property_Information_Items"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY property_items_update_authenticated
  ON "03_ecc_03_08_Property_Information_Items"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "03_ecc_03_08_Property_Information_Legal_Options" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_08_Property_Information"(incident_number) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_legal_options_incident_number
  ON "03_ecc_03_08_Property_Information_Legal_Options" (incident_number);

ALTER TABLE "03_ecc_03_08_Property_Information_Legal_Options" ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_legal_select_authenticated
  ON "03_ecc_03_08_Property_Information_Legal_Options"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY property_legal_insert_authenticated
  ON "03_ecc_03_08_Property_Information_Legal_Options"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY property_legal_update_authenticated
  ON "03_ecc_03_08_Property_Information_Legal_Options"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "03_ecc_03_08_Property_Information_Type_Options" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_08_Property_Information"(incident_number) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_type_options_incident_number
  ON "03_ecc_03_08_Property_Information_Type_Options" (incident_number);

ALTER TABLE "03_ecc_03_08_Property_Information_Type_Options" ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_type_select_authenticated
  ON "03_ecc_03_08_Property_Information_Type_Options"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY property_type_insert_authenticated
  ON "03_ecc_03_08_Property_Information_Type_Options"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY property_type_update_authenticated
  ON "03_ecc_03_08_Property_Information_Type_Options"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
