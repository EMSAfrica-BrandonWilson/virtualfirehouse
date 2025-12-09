
-- Enable Row Level Security
ALTER TABLE "public"."01_home_contact_us" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid errors)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."01_home_contact_us";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."01_home_contact_us";

-- Create policy to allow SELECT for everyone (authenticated and anonymous)
CREATE POLICY "Enable read access for all users" ON "public"."01_home_contact_us"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Create policy to allow INSERT for everyone (authenticated and anonymous)
CREATE POLICY "Enable insert access for all users" ON "public"."01_home_contact_us"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
