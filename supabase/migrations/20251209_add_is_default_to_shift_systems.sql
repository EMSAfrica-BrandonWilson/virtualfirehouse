
-- Add is_default column to 02_admin_shift_system_definitions table
ALTER TABLE "02_admin_shift_system_definitions" 
ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN DEFAULT false;

-- Create a unique index to ensure only one default system exists (optional but good practice)
-- However, enforcing this via SQL unique index with 'where is_default = true' is strict. 
-- For now, we will handle the "unset others" logic in the application or via a trigger if needed.
-- Let's stick to just adding the column first to be safe and flexible.

-- If we want to ensure only one true value:
-- CREATE UNIQUE INDEX unique_default_shift_system ON "02_admin_shift_system_definitions" (is_default) WHERE is_default = true;
