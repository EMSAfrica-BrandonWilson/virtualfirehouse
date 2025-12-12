CREATE TABLE IF NOT EXISTS "03_ecc_03_03_Responding_Resources" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
  responding_vehicles JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_incident_number ON "03_ecc_03_03_Responding_Resources" (incident_number);

-- Optional: keep updated_at in sync on updates
CREATE OR REPLACE FUNCTION set_updated_at_resources()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resources_set_updated_at ON "03_ecc_03_03_Responding_Resources";

CREATE TRIGGER trg_resources_set_updated_at
BEFORE UPDATE ON "03_ecc_03_03_Responding_Resources"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_resources();
