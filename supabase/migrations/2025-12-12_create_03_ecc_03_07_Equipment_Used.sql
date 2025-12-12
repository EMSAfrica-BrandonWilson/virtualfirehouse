-- Create Equipment Used items table for Incident Equipment Used page
-- Stores vehicles and equipment entries linked to an incident number

CREATE TABLE IF NOT EXISTS "03_ecc_03_07_Equipment_Used" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_01_Incident_Call_Taking"(incident_number) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('Vehicle','Equipment')),
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,2),
  time_used TEXT,
  per_unit_rate NUMERIC(12,2),
  cost_of_use NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(quantity, 0) * COALESCE(per_unit_rate, 0)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_equipment_used_incident_number ON "03_ecc_03_07_Equipment_Used"(incident_number);
CREATE INDEX IF NOT EXISTS idx_equipment_used_item_type ON "03_ecc_03_07_Equipment_Used"(item_type);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_equipment_used_updated_at
  BEFORE UPDATE ON "03_ecc_03_07_Equipment_Used"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security and policies
ALTER TABLE "03_ecc_03_07_Equipment_Used" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_used_select_authenticated" ON "03_ecc_03_07_Equipment_Used";
DROP POLICY IF EXISTS "equipment_used_insert_authenticated" ON "03_ecc_03_07_Equipment_Used";
DROP POLICY IF EXISTS "equipment_used_update_authenticated" ON "03_ecc_03_07_Equipment_Used";
DROP POLICY IF EXISTS "equipment_used_delete_authenticated" ON "03_ecc_03_07_Equipment_Used";

CREATE POLICY "equipment_used_select_authenticated"
ON "03_ecc_03_07_Equipment_Used"
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "equipment_used_insert_authenticated"
ON "03_ecc_03_07_Equipment_Used"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "equipment_used_update_authenticated"
ON "03_ecc_03_07_Equipment_Used"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "equipment_used_delete_authenticated"
ON "03_ecc_03_07_Equipment_Used"
FOR DELETE
USING (auth.role() = 'authenticated');
