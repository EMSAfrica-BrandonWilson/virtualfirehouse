-- Enable read access for all users
create policy "Enable read access for all users"
on "public"."02_admin_hr_04_leave_management"
as permissive
for select
to public
using (true);
