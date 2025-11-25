-- Migration: create_shift_system_definitions_table
-- Created: 2025-11-09
-- Purpose: Store form fields for shift system definition without JSON patterns

CREATE TABLE IF NOT EXISTS shift_system_definitions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  system_name TEXT NOT NULL UNIQUE,
  number_of_shifts INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  start_time TIME,
  duration_hours INTEGER NOT NULL DEFAULT 8,
  shift_names TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rotation_order INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  shift_colors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE shift_system_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY shift_system_definitions_select_authenticated
  ON shift_system_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY shift_system_definitions_insert_authenticated
  ON shift_system_definitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY shift_system_definitions_update_authenticated
  ON shift_system_definitions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shift_system_definitions_system_name
  ON shift_system_definitions (system_name);

COMMENT ON TABLE shift_system_definitions IS 'Stores shift system form fields; calendar patterns are computed client-side.';