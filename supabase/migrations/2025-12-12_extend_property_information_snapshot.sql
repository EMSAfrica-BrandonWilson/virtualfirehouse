ALTER TABLE "03_ecc_03_08_Property_Information"
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_contact TEXT,
  ADD COLUMN IF NOT EXISTS occupant_name TEXT,
  ADD COLUMN IF NOT EXISTS occupant_contact TEXT,
  ADD COLUMN IF NOT EXISTS legal_description TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT;
