ALTER TABLE "03_ecc_03_05_Casualties_&_Fatalities" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "casualties_select_authenticated" ON "03_ecc_03_05_Casualties_&_Fatalities";
DROP POLICY IF EXISTS "casualties_insert_authenticated" ON "03_ecc_03_05_Casualties_&_Fatalities";
DROP POLICY IF EXISTS "casualties_update_authenticated" ON "03_ecc_03_05_Casualties_&_Fatalities";

CREATE POLICY "casualties_select_authenticated"
ON "03_ecc_03_05_Casualties_&_Fatalities"
FOR SELECT
USING ( auth.role() = 'authenticated' );

CREATE POLICY "casualties_insert_authenticated"
ON "03_ecc_03_05_Casualties_&_Fatalities"
FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "casualties_update_authenticated"
ON "03_ecc_03_05_Casualties_&_Fatalities"
FOR UPDATE
USING ( auth.role() = 'authenticated' )
WITH CHECK ( auth.role() = 'authenticated' );

