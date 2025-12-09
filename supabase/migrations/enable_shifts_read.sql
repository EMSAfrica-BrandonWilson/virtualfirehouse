
-- Enable RLS (just in case)
ALTER TABLE "02_admin_register_fd2_operational_shifts" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid errors
DROP POLICY IF EXISTS "Allow public read access" ON "02_admin_register_fd2_operational_shifts";

-- Create policy to allow everyone to read
CREATE POLICY "Allow public read access"
ON "02_admin_register_fd2_operational_shifts"
FOR SELECT
TO public
USING (true);
