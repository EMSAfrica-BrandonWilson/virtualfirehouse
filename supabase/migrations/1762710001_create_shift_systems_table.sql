-- Migration: create_shift_systems_table
-- Created: 2025-11-09
-- Purpose: Store named shift systems with JSON patterns for calendar generation

-- Create table to store shift system definitions
CREATE TABLE IF NOT EXISTS shift_systems (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  system_name TEXT NOT NULL UNIQUE,
  patterns JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shift_systems ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to read/write
CREATE POLICY shift_systems_select_authenticated
  ON shift_systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY shift_systems_insert_authenticated
  ON shift_systems FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY shift_systems_update_authenticated
  ON shift_systems FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Helpful index for name-based lookups
CREATE INDEX IF NOT EXISTS idx_shift_systems_system_name ON shift_systems (system_name);

-- Optional: comment for clarity
COMMENT ON COLUMN shift_systems.patterns IS 'JSONB payload of shift pattern definitions used by the calendar UI';