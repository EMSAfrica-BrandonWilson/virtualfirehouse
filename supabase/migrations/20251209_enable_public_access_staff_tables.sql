-- Enable RLS and public access for Staff tables

-- 02_admin_staff_1_registration
ALTER TABLE "02_admin_staff_1_registration" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_1_registration" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_1_registration" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_1_registration" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_1_registration" AS PERMISSIVE FOR DELETE TO public USING (true);

-- 02_admin_staff_2_address
ALTER TABLE "02_admin_staff_2_address" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_2_address" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_2_address" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_2_address" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_2_address" AS PERMISSIVE FOR DELETE TO public USING (true);

-- 02_admin_staff_3_permits
ALTER TABLE "02_admin_staff_3_permits" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_3_permits" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_3_permits" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_3_permits" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_3_permits" AS PERMISSIVE FOR DELETE TO public USING (true);

-- 02_admin_staff_4_certification
ALTER TABLE "02_admin_staff_4_certification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_4_certification" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_4_certification" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_4_certification" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_4_certification" AS PERMISSIVE FOR DELETE TO public USING (true);

-- 02_admin_staff_7_emergency_contacts
ALTER TABLE "02_admin_staff_7_emergency_contacts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_7_emergency_contacts" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_7_emergency_contacts" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_7_emergency_contacts" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_7_emergency_contacts" AS PERMISSIVE FOR DELETE TO public USING (true);

-- 02_admin_staff_9_ranks
ALTER TABLE "02_admin_staff_9_ranks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "02_admin_staff_9_ranks" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON "02_admin_staff_9_ranks" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "02_admin_staff_9_ranks" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON "02_admin_staff_9_ranks" AS PERMISSIVE FOR DELETE TO public USING (true);
