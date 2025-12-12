ALTER TABLE "03_ecc_03_02_Incident_Call_Dispatching" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dispatching_select_authenticated" ON "03_ecc_03_02_Incident_Call_Dispatching";
DROP POLICY IF EXISTS "dispatching_insert_authenticated" ON "03_ecc_03_02_Incident_Call_Dispatching";
DROP POLICY IF EXISTS "dispatching_update_authenticated" ON "03_ecc_03_02_Incident_Call_Dispatching";

CREATE POLICY "dispatching_select_authenticated"
ON "03_ecc_03_02_Incident_Call_Dispatching"
FOR SELECT
USING ( auth.role() = 'authenticated' );

CREATE POLICY "dispatching_insert_authenticated"
ON "03_ecc_03_02_Incident_Call_Dispatching"
FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "dispatching_update_authenticated"
ON "03_ecc_03_02_Incident_Call_Dispatching"
FOR UPDATE
USING ( auth.role() = 'authenticated' )
WITH CHECK ( auth.role() = 'authenticated' );

