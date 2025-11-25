-- One-off SQL to set all staff to Blue Shift
-- Run this in Supabase SQL editor if you prefer a direct update
-- Note: ensure an operational_shifts row exists with shift_name containing 'Blue'

UPDATE staff_basic_info
SET operational_shift_id = (
  SELECT id
  FROM operational_shifts
  WHERE LOWER(shift_name) LIKE '%blue%'
  ORDER BY id
  LIMIT 1
)
WHERE staff_id IS NOT NULL;