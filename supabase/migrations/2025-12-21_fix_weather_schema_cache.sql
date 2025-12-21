
-- Ensure weather_jsonb column exists
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS weather_jsonb JSONB DEFAULT '{}'::jsonb;

-- Ensure other columns exist just in case
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS weather_text TEXT;
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS location_id TEXT;
ALTER TABLE "03_ecc_03_10_Weather_Information" ADD COLUMN IF NOT EXISTS fire_risk_explanation TEXT;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
