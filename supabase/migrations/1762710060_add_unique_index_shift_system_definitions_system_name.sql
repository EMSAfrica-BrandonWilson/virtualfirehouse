-- Migration: add_unique_index_shift_system_definitions_system_name
-- Purpose: Ensure ON CONFLICT(system_name) works by adding a unique index

-- Create a unique index on system_name if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'ux_shift_system_definitions_system_name'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX ux_shift_system_definitions_system_name
             ON public.shift_system_definitions (system_name)';
  END IF;
END $$;

-- Also add a named constraint if missing (defensive in case table pre-existed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shift_system_definitions_system_name_key'
  ) THEN
    BEGIN
      ALTER TABLE public.shift_system_definitions
        ADD CONSTRAINT shift_system_definitions_system_name_key UNIQUE (system_name);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN
      -- ignore if another process added it concurrently
      NULL;
    END;
  END IF;
END $$;

COMMENT ON INDEX ux_shift_system_definitions_system_name IS 'Enforces unique system_name for upsert conflict target';