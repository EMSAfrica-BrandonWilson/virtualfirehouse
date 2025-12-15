-- Create table for incident cancellations to support false alarm reporting
create table if not exists public."03_ecc_03_05_Incident_Cancellations" (
  id bigint generated always as identity primary key,
  incident_number text not null,
  cancel_reason text not null,
  cancelled_at timestamp with time zone default now() not null,
  shift_on_duty text,
  call_taker_id text
);

create index if not exists "idx_03_ecc_03_05_incident_number"
  on public."03_ecc_03_05_Incident_Cancellations"(incident_number);

comment on table public."03_ecc_03_05_Incident_Cancellations" is 'Records cancellation events for incidents, including false alarm categories, for reporting.';
