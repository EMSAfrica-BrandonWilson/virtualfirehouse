create table if not exists public."03_ecc_03_06_Incident_Lock_Status" (
  id bigint generated always as identity primary key,
  incident_number text not null unique,
  dispatcher_confirmed boolean not null default false,
  oic_confirmed boolean not null default false,
  admin_confirmed boolean not null default false,
  updated_at timestamp with time zone default now() not null
);

create index if not exists "idx_03_ecc_03_06_incident_number"
  on public."03_ecc_03_06_Incident_Lock_Status"(incident_number);
