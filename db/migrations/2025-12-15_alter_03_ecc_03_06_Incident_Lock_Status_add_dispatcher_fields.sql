alter table if exists public."03_ecc_03_06_Incident_Lock_Status"
  add column if not exists dispatcher_user_name text,
  add column if not exists dispatcher_confirmed_at timestamp with time zone;
