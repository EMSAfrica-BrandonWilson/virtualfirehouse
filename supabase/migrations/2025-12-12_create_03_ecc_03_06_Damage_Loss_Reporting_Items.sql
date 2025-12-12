CREATE TABLE IF NOT EXISTS "03_ecc_03_06_Damage_Loss_Reporting_Items" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_06_Damage_Loss_Reporting"(incident_number) ON DELETE CASCADE,
  structure_loss NUMERIC(12,2),
  contents_loss NUMERIC(12,2),
  other_loss NUMERIC(12,2),
  salvage_value NUMERIC(12,2),
  total_estimated_loss NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(structure_loss, 0) + COALESCE(contents_loss, 0) + COALESCE(other_loss, 0) - COALESCE(salvage_value, 0)
  ) STORED,
  possible_cause TEXT,
  area_of_origin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_damage_loss_items_incident_number
  ON "03_ecc_03_06_Damage_Loss_Reporting_Items" (incident_number);

ALTER TABLE "03_ecc_03_06_Damage_Loss_Reporting_Items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS damage_loss_items_select_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting_Items";
DROP POLICY IF EXISTS damage_loss_items_insert_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting_Items";
DROP POLICY IF EXISTS damage_loss_items_update_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting_Items";

CREATE POLICY damage_loss_items_select_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting_Items"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY damage_loss_items_insert_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting_Items"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY damage_loss_items_update_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting_Items"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
