-- Migration: Create daily vehicle records table for storing updated maintenance information
-- Created at: 1763197000
-- Purpose: Store vehicles out of service with updated maintenance type and reason data

CREATE TABLE IF NOT EXISTS public.daily_vehicle_records (
    id BIGSERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    vehicles_data JSONB NOT NULL, -- Array of vehicle objects with maintenance info
    notes TEXT DEFAULT '',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure only one record per date
CREATE UNIQUE INDEX IF NOT EXISTS daily_vehicle_records_unique_per_date 
ON public.daily_vehicle_records (record_date);

-- Create index for efficient date-based queries
CREATE INDEX IF NOT EXISTS daily_vehicle_records_date_idx 
ON public.daily_vehicle_records (record_date);

-- Create index for user-based queries
CREATE INDEX IF NOT EXISTS daily_vehicle_records_created_by_idx 
ON public.daily_vehicle_records (created_by);

-- Enable RLS
ALTER TABLE public.daily_vehicle_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all daily vehicle records" 
ON public.daily_vehicle_records FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Authenticated users can insert daily vehicle records" 
ON public.daily_vehicle_records FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily vehicle records" 
ON public.daily_vehicle_records FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete daily vehicle records" 
ON public.daily_vehicle_records FOR DELETE 
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT ON public.daily_vehicle_records TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_vehicle_records TO authenticated;
GRANT USAGE ON SEQUENCE public.daily_vehicle_records_id_seq TO authenticated;

-- Add table comment
COMMENT ON TABLE public.daily_vehicle_records IS 'Stores daily records of vehicles out of service with updated maintenance information';