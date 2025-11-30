-- Migration: Auto-copy vehicle out of service records daily at midnight (local timezone UTC+3)
-- Created: 2025-11-30
-- Description: Creates a PostgreSQL function and cron job to automatically copy yesterday's 
--              vehicle out-of-service records to today at midnight local time.

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the function to copy yesterday's vehicle record to today
CREATE OR REPLACE FUNCTION copy_yesterday_vehicle_record_to_today()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_yesterday_record RECORD;
  v_existing_count INTEGER;
BEGIN
  -- Get dates
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';
  
  -- Check if today's record already exists
  SELECT COUNT(*) INTO v_existing_count
  FROM daily_vehicle_records
  WHERE record_date = v_today;
  
  IF v_existing_count > 0 THEN
    RETURN 'already_exists';
  END IF;
  
  -- Get yesterday's record
  SELECT * INTO v_yesterday_record
  FROM daily_vehicle_records
  WHERE record_date = v_yesterday
  LIMIT 1;
  
  -- Check if yesterday's record exists
  IF v_yesterday_record IS NULL THEN
    RETURN 'no_previous_record';
  END IF;
  
  -- Copy yesterday's record to today
  INSERT INTO daily_vehicle_records (
    record_date,
    vehicles_data,
    notes,
    created_by,
    created_at
  )
  VALUES (
    v_today,
    v_yesterday_record.vehicles_data,
    'Auto-copied from ' || v_yesterday::TEXT,
    'SYSTEM_AUTO_COPY',
    NOW()
  );
  
  RETURN 'success';
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'error: ' || SQLERRM;
END;
$$;

-- Create cron job to run at midnight local time (UTC+3)
-- Schedule: 0 21 * * * means 21:00 UTC = 00:00 UTC+3 (midnight local time)
SELECT cron.schedule(
  'daily_vehicle_record_copy',
  '0 21 * * *',
  $$SELECT copy_yesterday_vehicle_record_to_today();$$
);

-- Add comment to document the timezone adjustment
COMMENT ON FUNCTION copy_yesterday_vehicle_record_to_today() IS 
'Automatically copies yesterday''s vehicle out-of-service record to today. 
Scheduled to run daily at midnight local time (UTC+3) via pg_cron.
Cron schedule: 0 21 * * * (21:00 UTC = 00:00 UTC+3)';
