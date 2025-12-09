-- Create buckets
insert into storage.buckets (id, name, public)
values 
  ('sop-documents', 'sop-documents', true),
  ('station-orders-documents', 'station-orders-documents', true)
on conflict (id) do nothing;

-- SOPs Storage Policies
create policy "Public Access SOPs"
on storage.objects for select
to public
using ( bucket_id = 'sop-documents' );

create policy "Auth Upload SOPs"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'sop-documents' );

create policy "Auth Update SOPs"
on storage.objects for update
to authenticated
using ( bucket_id = 'sop-documents' );

create policy "Auth Delete SOPs"
on storage.objects for delete
to authenticated
using ( bucket_id = 'sop-documents' );

-- Station Orders Storage Policies
create policy "Public Access Station Orders"
on storage.objects for select
to public
using ( bucket_id = 'station-orders-documents' );

create policy "Auth Upload Station Orders"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'station-orders-documents' );

create policy "Auth Update Station Orders"
on storage.objects for update
to authenticated
using ( bucket_id = 'station-orders-documents' );

create policy "Auth Delete Station Orders"
on storage.objects for delete
to authenticated
using ( bucket_id = 'station-orders-documents' );
