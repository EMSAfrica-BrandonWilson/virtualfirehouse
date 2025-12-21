
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS "03_ecc_03_10_Weather_Information" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL REFERENCES "03_ecc_03_01_Incident_Call_Taking"(incident_number) ON DELETE CASCADE,
  location_id TEXT,
  weather_text TEXT,
  weather_jsonb JSONB DEFAULT '{}'::jsonb,
  fire_risk_explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add specific columns for extracted data if they don't exist
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS temperature TEXT;
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS fire_risk_index TEXT;
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS air_quality_index TEXT;
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS pollutants_forecast TEXT;

-- Index
CREATE INDEX IF NOT EXISTS idx_weather_info_incident_number ON "03_ecc_03_10_Weather_Information"(incident_number);

-- Enable RLS
ALTER TABLE "03_ecc_03_10_Weather_Information" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "weather_info_select_authenticated" ON "03_ecc_03_10_Weather_Information";
DROP POLICY IF EXISTS "weather_info_insert_authenticated" ON "03_ecc_03_10_Weather_Information";
DROP POLICY IF EXISTS "weather_info_update_authenticated" ON "03_ecc_03_10_Weather_Information";

CREATE POLICY "weather_info_select_authenticated"
ON "03_ecc_03_10_Weather_Information"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "weather_info_insert_authenticated"
ON "03_ecc_03_10_Weather_Information"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "weather_info_update_authenticated"
ON "03_ecc_03_10_Weather_Information"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
