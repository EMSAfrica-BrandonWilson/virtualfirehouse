# Automatic Daily Vehicle Record Copy - Setup Instructions

## Overview
This migration sets up automatic copying of vehicle out-of-service records from one day to the next at midnight (local timezone UTC+3).

## Migration File
- **Location**: `supabase/migrations/1764503208_create_auto_copy_daily_vehicle_records.sql`
- **Schedule**: Runs daily at 21:00 UTC (00:00 UTC+3 local time)

## Prerequisites

1. **Enable pg_cron Extension**:
   - Go to your Supabase Dashboard
   - Navigate to: Database > Extensions
   - Find `pg_cron` and click "Enable"

## How to Apply

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd e:\VirtualFireHouse\virtualfirehouse

# Apply migration
supabase db push
```

### Option 2: Manual Application (via Supabase Dashboard)

1. Open Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/1764503208_create_auto_copy_daily_vehicle_records.sql`
3. Paste into SQL Editor
4. Click "Run"

## Testing the Function

### Manual Test

Run this in Supabase SQL Editor:

```sql
-- Test the function manually
SELECT copy_yesterday_vehicle_record_to_today();
```

Expected results:
- `'success'` - Record was copied successfully
- `'already_exists'` - Today's record already exists
- `'no_previous_record'` - No record exists for yesterday
- `'error: ...'` - An error occurred (with details)

### Verify Cron Job is Scheduled

```sql
-- Check that the cron job exists
SELECT * FROM cron.job WHERE jobname = 'daily_vehicle_record_copy';
```

Expected output: One row with:
- `jobname`: `daily_vehicle_record_copy`
- `schedule`: `0 21 * * *`
- `command`: `SELECT copy_yesterday_vehicle_record_to_today();`

### Check Execution History

```sql
-- View recent cron job executions (if available)
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily_vehicle_record_copy')
ORDER BY start_time DESC 
LIMIT 10;
```

## How It Works

1. **Every day at 21:00 UTC (00:00 local)**:
   - Function `copy_yesterday_vehicle_record_to_today()` runs automatically
   
2. **Function checks**:
   - Does a record already exist for today?
   - If yes → Returns `'already_exists'` (no action)
   - If no → Proceeds to copy
   
3. **Copy process**:
   - Fetches yesterday's record from `daily_vehicle_records`
   - Copies the `vehicles_data` JSON field to a new record for today
   - Sets `created_by` to `'SYSTEM_AUTO_COPY'` to identify auto-copied records
   - Adds a note: `'Auto-copied from YYYY-MM-DD'`

## Monitoring

### Check Recent Auto-Copies

```sql
SELECT 
  record_date,
  created_at,
  created_by,
  notes,
  jsonb_array_length(vehicles_data) as vehicle_count
FROM daily_vehicle_records
WHERE created_by = 'SYSTEM_AUTO_COPY'
ORDER BY record_date DESC
LIMIT 10;
```

### Verify Today's Record

```sql
SELECT 
  record_date,
  created_at,
  created_by,
  notes
FROM daily_vehicle_records
WHERE record_date = CURRENT_DATE;
```

## Troubleshooting

### Cron Job Not Running

1. Verify pg_cron is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check for errors in cron execution:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE status != 'succeeded' 
   ORDER BY start_time DESC LIMIT 5;
   ```

### No Records Being Copied

- Ensure yesterday's record exists
- Check that the function runs successfully: `SELECT copy_yesterday_vehicle_record_to_today();`
- Verify the cron schedule is correct for your timezone

### Timezone Issues

If records are being created at the wrong time:
- The cron schedule is set for UTC+3 (21:00 UTC = 00:00 local)
- To adjust for a different timezone, modify the cron schedule in the migration file
- Formula: `local_hour - UTC_offset = UTC_hour`
- Example for UTC+5: `0 19 * * *` (19:00 UTC = 00:00 UTC+5)

## Uninstalling

To remove the auto-copy functionality:

```sql
-- Remove the cron job
SELECT cron.unschedule('daily_vehicle_record_copy');

-- Drop the function
DROP FUNCTION IF EXISTS copy_yesterday_vehicle_record_to_today();
```
