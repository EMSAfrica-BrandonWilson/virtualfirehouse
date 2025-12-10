-- Create Incident Call Taking table
-- Stores values captured on the Incident Call Taking page

CREATE TABLE IF NOT EXISTS "03_ecc_03_01_Incident_Call_Taking" (
    id BIGSERIAL PRIMARY KEY,
    incident_number TEXT NOT NULL UNIQUE,
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    shift_on_duty TEXT,
    call_taker_id TEXT,
    caller_name TEXT,
    caller_number TEXT,
    second_caller_name TEXT,
    second_caller_number TEXT,
    incident_category TEXT,
    incident_sub_category TEXT,
    street_no TEXT,
    street_name TEXT,
    suburb TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for querying
CREATE INDEX IF NOT EXISTS idx_ict_created_at ON "03_ecc_03_01_Incident_Call_Taking"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ict_incident_date ON "03_ecc_03_01_Incident_Call_Taking"(incident_date);

