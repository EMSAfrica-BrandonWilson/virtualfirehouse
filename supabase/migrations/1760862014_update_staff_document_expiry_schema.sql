-- Update staff_document_expiry table to support the new document entry form with specific fields

-- Drop the old table and recreate with new schema
DROP TABLE IF EXISTS public.staff_document_expiry CASCADE;

-- Create new staff_document_expiry table with specific fields
CREATE TABLE IF NOT EXISTS public.staff_document_expiry (
    document_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE UNIQUE,
    document_type VARCHAR(100),
    
    -- Passport fields
    passport_number VARCHAR(100),
    passport_expiry_date DATE,
    
    -- Visa fields
    visa_type VARCHAR(100),
    visa_expiry_date DATE,
    
    -- National ID / Iqama field
    national_id_expiry_date DATE,
    
    -- Driver's License fields
    driving_license_type VARCHAR(100),
    driving_license_expiry_date DATE,
    
    -- Security Access Permit field
    security_access_permit_expiry_date DATE,
    
    -- Aerodrome Driver's Permit field
    aerodrome_driving_permit_expiry_date DATE,
    
    -- Medical Fitness field
    medical_fitness_expiry_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_document_expiry_staff_id ON public.staff_document_expiry(staff_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.staff_document_expiry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view staff_document_expiry" 
    ON public.staff_document_expiry FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Allow authenticated users to insert staff_document_expiry" 
    ON public.staff_document_expiry FOR INSERT TO authenticated WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update staff_document_expiry" 
    ON public.staff_document_expiry FOR UPDATE TO authenticated USING (true);
    
CREATE POLICY "Allow authenticated users to delete staff_document_expiry" 
    ON public.staff_document_expiry FOR DELETE TO authenticated USING (true);
