CREATE TABLE IF NOT EXISTS "03_ecc_03_06_Damage_Loss_Reporting" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
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

CREATE INDEX IF NOT EXISTS idx_damage_loss_incident_number
  ON "03_ecc_03_06_Damage_Loss_Reporting" (incident_number);

ALTER TABLE "03_ecc_03_06_Damage_Loss_Reporting" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS damage_loss_select_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting";
DROP POLICY IF EXISTS damage_loss_insert_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting";
DROP POLICY IF EXISTS damage_loss_update_authenticated ON "03_ecc_03_06_Damage_Loss_Reporting";

CREATE POLICY damage_loss_select_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY damage_loss_insert_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY damage_loss_update_authenticated
ON "03_ecc_03_06_Damage_Loss_Reporting"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
