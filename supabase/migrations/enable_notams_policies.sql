-- Enable RLS
alter table "public"."03_ecc_01_edob_06_notams" enable row level security;

-- Policy: Allow public read access
create policy "Enable read access for all users"
on "public"."03_ecc_01_edob_06_notams"
for select
to public
using (true);

-- Policy: Allow authenticated insert
create policy "Enable insert for authenticated users only"
on "public"."03_ecc_01_edob_06_notams"
for insert
to authenticated
with check (true);

-- Policy: Allow authenticated update
create policy "Enable update for authenticated users only"
on "public"."03_ecc_01_edob_06_notams"
for update
to authenticated
using (true)
with check (true);

-- Policy: Allow authenticated delete
create policy "Enable delete for authenticated users only"
on "public"."03_ecc_01_edob_06_notams"
for delete
to authenticated
using (true);
