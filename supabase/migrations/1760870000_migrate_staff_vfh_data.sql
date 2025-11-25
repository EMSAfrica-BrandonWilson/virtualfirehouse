-- Migration: Transfer data from staff_vfh to new staff table structure
-- Date: 2025-10-19
-- Purpose: Migrate 87 staff records from legacy staff_vfh table to staff_basic_info,
--          staff_emergency_contacts, and staff_addresses tables

-- Step 1: Migrate basic staff information from staff_vfh to staff_basic_info
INSERT INTO public.staff_basic_info (
    employee_number,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    nationality,
    photo_url,
    operational_shift_id,
    fire_dept_id,
    fire_station_id,
    employment_start_date,
    gender,
    created_at,
    updated_at
)
SELECT 
    staff_id,                    -- old staff_id (VARCHAR) maps to new employee_number
    first_name,
    NULL,                        -- middle_name not in old table
    last_name,
    NULL,                        -- date_of_birth not in old table
    NULL,                        -- nationality not in old table
    staff_image_url,             -- maps to photo_url
    operational_shift_id,
    department_id,               -- maps to fire_dept_id
    fire_station_id,
    hire_date,                   -- maps to employment_start_date
    NULL,                        -- gender not in old table
    created_at,
    updated_at
FROM public.staff_vfh
WHERE staff_id NOT IN (SELECT employee_number FROM public.staff_basic_info);

-- Step 2: Migrate emergency contact information
-- Only migrate records where emergency contact data exists
INSERT INTO public.staff_emergency_contacts (
    staff_id,
    contact_name,
    relationship,
    phone_number,
    alternate_phone,
    address,
    email,
    created_at,
    updated_at
)
SELECT 
    sbi.staff_id,                           -- use the new auto-generated staff_id
    sv.emergency_contact_name,
    sv.emergency_contact_relationship,
    sv.emergency_contact_phone,
    NULL,                                    -- alternate_phone not in old table
    NULL,                                    -- address not in old table
    NULL,                                    -- email not in old table
    sv.created_at,
    sv.updated_at
FROM public.staff_vfh sv
INNER JOIN public.staff_basic_info sbi ON sbi.employee_number = sv.staff_id
WHERE sv.emergency_contact_name IS NOT NULL 
  AND sv.emergency_contact_name != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.staff_emergency_contacts sec 
    WHERE sec.staff_id = sbi.staff_id
  );

-- Step 3: Migrate address information
-- Only migrate records where address data exists
INSERT INTO public.staff_addresses (
    staff_id,
    current_country,
    current_state,
    current_city,
    current_suburb,
    current_postal_code,
    current_street_address,
    permanent_country,
    permanent_state,
    permanent_city,
    permanent_suburb,
    permanent_postal_code,
    permanent_street_address,
    created_at,
    updated_at
)
SELECT 
    sbi.staff_id,                           -- use the new auto-generated staff_id
    NULL,                                    -- current_country not in old table
    NULL,                                    -- current_state not in old table
    NULL,                                    -- current_city not in old table
    NULL,                                    -- current_suburb not in old table
    NULL,                                    -- current_postal_code not in old table
    sv.address,                              -- old address field maps to current_street_address
    NULL,                                    -- permanent_country not in old table
    NULL,                                    -- permanent_state not in old table
    NULL,                                    -- permanent_city not in old table
    NULL,                                    -- permanent_suburb not in old table
    NULL,                                    -- permanent_postal_code not in old table
    NULL,                                    -- permanent_street_address not in old table
    sv.created_at,
    sv.updated_at
FROM public.staff_vfh sv
INNER JOIN public.staff_basic_info sbi ON sbi.employee_number = sv.staff_id
WHERE sv.address IS NOT NULL 
  AND sv.address != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.staff_addresses sa 
    WHERE sa.staff_id = sbi.staff_id
  );

-- Step 4: Drop legacy/unused tables
-- Only drop after successful migration
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.staff_registrations CASCADE;
DROP TABLE IF EXISTS public.staff_vfh CASCADE;

-- Verification queries (commented out, for manual verification if needed)
-- SELECT COUNT(*) as total_staff FROM public.staff_basic_info;
-- SELECT COUNT(*) as total_emergency_contacts FROM public.staff_emergency_contacts;
-- SELECT COUNT(*) as total_addresses FROM public.staff_addresses;
