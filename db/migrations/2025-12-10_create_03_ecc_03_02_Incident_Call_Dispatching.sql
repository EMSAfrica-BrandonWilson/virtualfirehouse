CREATE TABLE IF NOT EXISTS "03_ecc_03_02_Incident_Call_Dispatching" (
  id BIGSERIAL PRIMARY KEY,
  incident_number TEXT NOT NULL UNIQUE,
  dispatch_date DATE NOT NULL,
  dispatch_time TEXT NOT NULL,
  dispatcher_id TEXT,
  dispatched_stations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatching_incident_number ON "03_ecc_03_02_Incident_Call_Dispatching" (incident_number);
