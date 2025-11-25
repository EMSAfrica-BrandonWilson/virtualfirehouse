-- Drop unused tables migration
-- This migration removes tables determined to be unused by the application.
-- It uses IF EXISTS to avoid errors if a table was already removed, and CASCADE
-- to clean up dependent constraints/triggers/policies.

BEGIN;

-- NOTE: Staff Registration tables are REQUIRED and must be retained.
-- Protected tables (do NOT drop):
--   public.staff_addresses
--   public.staff_emergency_contacts
--   public.staff_training_records
--   public.staff_achievements
--   public.staff_disciplinary_records
--   public.staff_document_expiry

-- Backup tables before drop (data-preserving). Indexes/policies/triggers are not copied.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='equipment') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.equipment_backup (LIKE public.equipment INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.equipment_backup SELECT * FROM public.equipment';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='manufacturers') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.manufacturers_backup (LIKE public.manufacturers INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.manufacturers_backup SELECT * FROM public.manufacturers';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='model_makes') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.model_makes_backup (LIKE public.model_makes INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.model_makes_backup SELECT * FROM public.model_makes';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='location_departments') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.location_departments_backup (LIKE public.location_departments INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.location_departments_backup SELECT * FROM public.location_departments';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_activity_log') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.user_activity_log_backup (LIKE public.user_activity_log INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.user_activity_log_backup SELECT * FROM public.user_activity_log';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='role_assignment_audit') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.role_assignment_audit_backup (LIKE public.role_assignment_audit INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.role_assignment_audit_backup SELECT * FROM public.role_assignment_audit';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='menu_item_audit_log') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.menu_item_audit_log_backup (LIKE public.menu_item_audit_log INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.menu_item_audit_log_backup SELECT * FROM public.menu_item_audit_log';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='room_audit_log') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.room_audit_log_backup (LIKE public.room_audit_log INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.room_audit_log_backup SELECT * FROM public.room_audit_log';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='equipment_audit_log') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.equipment_audit_log_backup (LIKE public.equipment_audit_log INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.equipment_audit_log_backup SELECT * FROM public.equipment_audit_log';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='department_types') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.department_types_backup (LIKE public.department_types INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.department_types_backup SELECT * FROM public.department_types';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='countries') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.countries_backup (LIKE public.countries INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.countries_backup SELECT * FROM public.countries';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='department_status') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.department_status_backup (LIKE public.department_status INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.department_status_backup SELECT * FROM public.department_status';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='shift_systems') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.shift_systems_backup (LIKE public.shift_systems INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.shift_systems_backup SELECT * FROM public.shift_systems';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='positions') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.positions_backup (LIKE public.positions INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.positions_backup SELECT * FROM public.positions';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='employment_status') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.employment_status_backup (LIKE public.employment_status INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.employment_status_backup SELECT * FROM public.employment_status';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='emergency_contact_relationships') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.emergency_contact_relationships_backup (LIKE public.emergency_contact_relationships INCLUDING ALL)';
    EXECUTE 'INSERT INTO public.emergency_contact_relationships_backup SELECT * FROM public.emergency_contact_relationships';
  END IF;
END $$;

-- Equipment ecosystem tables
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.manufacturers CASCADE;
DROP TABLE IF EXISTS public.model_makes CASCADE;
DROP TABLE IF EXISTS public.location_departments CASCADE;

-- Admin/audit tables
DROP TABLE IF EXISTS public.user_activity_log CASCADE;
DROP TABLE IF EXISTS public.role_assignment_audit CASCADE;
DROP TABLE IF EXISTS public.menu_item_audit_log CASCADE;
DROP TABLE IF EXISTS public.room_audit_log CASCADE;
DROP TABLE IF EXISTS public.equipment_audit_log CASCADE;

-- Org dropdowns and statuses
DROP TABLE IF EXISTS public.department_types CASCADE;
DROP TABLE IF EXISTS public.countries CASCADE;
DROP TABLE IF EXISTS public.department_status CASCADE;

-- Shift systems (definitions retained)
DROP TABLE IF EXISTS public.shift_systems CASCADE;

-- HR dropdowns
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.employment_status CASCADE;
DROP TABLE IF EXISTS public.emergency_contact_relationships CASCADE;

COMMIT;