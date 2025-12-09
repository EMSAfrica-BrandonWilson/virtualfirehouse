-- ICAO Documents
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_icao"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_icao"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_icao"
as permissive
for delete
to authenticated
using (true);

-- GACAR Documents
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_gacar"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_gacar"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_gacar"
as permissive
for delete
to authenticated
using (true);

-- Local Regulations Documents
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_local"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_local"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_local"
as permissive
for delete
to authenticated
using (true);

-- Compliance Audit Documents
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_compliance_audits"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_compliance_audits"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_compliance_audits"
as permissive
for delete
to authenticated
using (true);
