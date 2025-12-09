-- Create buckets
insert into storage.buckets (id, name, public)
values 
  ('icao-documents', 'icao-documents', true),
  ('gacar-documents', 'gacar-documents', true),
  ('local-regulations-documents', 'local-regulations-documents', true),
  ('compliance-records-documents', 'compliance-records-documents', true)
on conflict (id) do nothing;

-- ICAO Policies
create policy "Public Access ICAO"
on storage.objects for select
to public
using ( bucket_id = 'icao-documents' );

create policy "Auth Upload ICAO"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'icao-documents' );

create policy "Auth Delete ICAO"
on storage.objects for delete
to authenticated
using ( bucket_id = 'icao-documents' );

-- GACAR Policies
create policy "Public Access GACAR"
on storage.objects for select
to public
using ( bucket_id = 'gacar-documents' );

create policy "Auth Upload GACAR"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'gacar-documents' );

create policy "Auth Delete GACAR"
on storage.objects for delete
to authenticated
using ( bucket_id = 'gacar-documents' );

-- Local Regulations Policies
create policy "Public Access Local"
on storage.objects for select
to public
using ( bucket_id = 'local-regulations-documents' );

create policy "Auth Upload Local"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'local-regulations-documents' );

create policy "Auth Delete Local"
on storage.objects for delete
to authenticated
using ( bucket_id = 'local-regulations-documents' );

-- Compliance Records Policies
create policy "Public Access Compliance"
on storage.objects for select
to public
using ( bucket_id = 'compliance-records-documents' );

create policy "Auth Upload Compliance"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'compliance-records-documents' );

create policy "Auth Delete Compliance"
on storage.objects for delete
to authenticated
using ( bucket_id = 'compliance-records-documents' );
