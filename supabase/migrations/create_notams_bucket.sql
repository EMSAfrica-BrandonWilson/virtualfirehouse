-- Create the bucket
insert into storage.buckets (id, name, public)
values ('notam-documents', 'notam-documents', true)
on conflict (id) do nothing;

-- Policy: Public read
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'notam-documents' );

-- Policy: Authenticated upload
create policy "Authenticated users can upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'notam-documents' );

-- Policy: Authenticated update
create policy "Authenticated users can update"
on storage.objects for update
to authenticated
using ( bucket_id = 'notam-documents' );
