
-- Add is_default column to departments table if it doesn't exist
ALTER TABLE "public"."02_admin_register_fd1_departments"
ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN "public"."02_admin_register_fd1_departments"."is_default" IS 'Indicates if this department is the default one for the site header and site-wide usage.';
