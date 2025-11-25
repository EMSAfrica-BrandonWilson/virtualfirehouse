-- Create staff_basic_info table (main table)
CREATE TABLE IF NOT EXISTS public.staff_basic_info (
    staff_id SERIAL PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(100),
    photo_url TEXT,
    operational_shift_id INTEGER REFERENCES public.operational_shift_dropdown(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_addresses table
CREATE TABLE IF NOT EXISTS public.staff_addresses (
    address_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    residential_address TEXT,
    residential_city VARCHAR(100),
    residential_postal_code VARCHAR(20),
    postal_address TEXT,
    postal_city VARCHAR(100),
    postal_postal_code VARCHAR(20),
    phone_number VARCHAR(50),
    mobile_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_document_expiry table
CREATE TABLE IF NOT EXISTS public.staff_document_expiry (
    document_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(200),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_training_records table
CREATE TABLE IF NOT EXISTS public.staff_training_records (
    training_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    course_name VARCHAR(200) NOT NULL,
    training_provider VARCHAR(200),
    start_date DATE,
    end_date DATE,
    certification_obtained VARCHAR(200),
    certificate_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_achievements table
CREATE TABLE IF NOT EXISTS public.staff_achievements (
    achievement_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    achievement_type VARCHAR(100),
    achievement_date DATE,
    description TEXT,
    recognition_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_disciplinary_records table
CREATE TABLE IF NOT EXISTS public.staff_disciplinary_records (
    disciplinary_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    incident_date DATE,
    incident_type VARCHAR(100),
    description TEXT,
    action_taken TEXT,
    resolution_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_emergency_contacts table
CREATE TABLE IF NOT EXISTS public.staff_emergency_contacts (
    contact_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff_basic_info(staff_id) ON DELETE CASCADE,
    contact_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100),
    phone_number VARCHAR(50),
    alternate_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_addresses_staff_id ON public.staff_addresses(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_document_expiry_staff_id ON public.staff_document_expiry(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_records_staff_id ON public.staff_training_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_achievements_staff_id ON public.staff_achievements(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_disciplinary_records_staff_id ON public.staff_disciplinary_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_emergency_contacts_staff_id ON public.staff_emergency_contacts(staff_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.staff_basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_document_expiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view staff_basic_info" ON public.staff_basic_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_basic_info" ON public.staff_basic_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_basic_info" ON public.staff_basic_info FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_basic_info" ON public.staff_basic_info FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_addresses" ON public.staff_addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_addresses" ON public.staff_addresses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_addresses" ON public.staff_addresses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_addresses" ON public.staff_addresses FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_document_expiry" ON public.staff_document_expiry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_document_expiry" ON public.staff_document_expiry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_document_expiry" ON public.staff_document_expiry FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_document_expiry" ON public.staff_document_expiry FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_training_records" ON public.staff_training_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_training_records" ON public.staff_training_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_training_records" ON public.staff_training_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_training_records" ON public.staff_training_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_achievements" ON public.staff_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_achievements" ON public.staff_achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_achievements" ON public.staff_achievements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_achievements" ON public.staff_achievements FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_disciplinary_records" ON public.staff_disciplinary_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_disciplinary_records" ON public.staff_disciplinary_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_disciplinary_records" ON public.staff_disciplinary_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_disciplinary_records" ON public.staff_disciplinary_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view staff_emergency_contacts" ON public.staff_emergency_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert staff_emergency_contacts" ON public.staff_emergency_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update staff_emergency_contacts" ON public.staff_emergency_contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete staff_emergency_contacts" ON public.staff_emergency_contacts FOR DELETE TO authenticated USING (true);
