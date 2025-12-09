-- SOPs Documents Policies
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_sops"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_sops"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users"
on "public"."02_admin_regulatory_documents_sops"
as permissive
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_sops"
as permissive
for delete
to authenticated
using (true);

-- Station Orders Documents Policies
create policy "Enable read access for all users"
on "public"."02_admin_regulatory_documents_station_orders"
as permissive
for select
to public
using (true);

create policy "Enable insert for authenticated users"
on "public"."02_admin_regulatory_documents_station_orders"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users"
on "public"."02_admin_regulatory_documents_station_orders"
as permissive
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users"
on "public"."02_admin_regulatory_documents_station_orders"
as permissive
for delete
to authenticated
using (true);
