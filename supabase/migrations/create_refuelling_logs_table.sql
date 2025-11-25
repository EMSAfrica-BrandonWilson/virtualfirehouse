-- Create refuelling_logs table
CREATE TABLE IF NOT EXISTS public.refuelling_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refuelling_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    vehicle_id VARCHAR(100) NOT NULL,
    odometer_reading DECIMAL(10, 2),
    fuel_type VARCHAR(50) NOT NULL,
    quantity_litres DECIMAL(10, 2) NOT NULL,
    pump_start_reading DECIMAL(10, 2),
    pump_end_reading DECIMAL(10, 2),
    operator_name VARCHAR(255) NOT NULL,
    operator_signature VARCHAR(255),
    spills_incidents TEXT,
    tank_fill_percentage INTEGER,
    authorization_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on vehicle_id for faster queries
CREATE INDEX IF NOT EXISTS idx_refuelling_logs_vehicle_id ON public.refuelling_logs(vehicle_id);

-- Add index on refuelling_date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_refuelling_logs_date ON public.refuelling_logs(refuelling_date DESC);

-- Enable Row Level Security
ALTER TABLE public.refuelling_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all refuelling logs
CREATE POLICY "Allow authenticated users to read refuelling logs"
ON public.refuelling_logs
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert refuelling logs
CREATE POLICY "Allow authenticated users to insert refuelling logs"
ON public.refuelling_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow users to update their own refuelling logs
CREATE POLICY "Allow users to update own refuelling logs"
ON public.refuelling_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_refuelling_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refuelling_logs_updated_at
BEFORE UPDATE ON public.refuelling_logs
FOR EACH ROW
EXECUTE FUNCTION update_refuelling_logs_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.refuelling_logs TO authenticated;
GRANT USAGE ON SEQUENCE IF EXISTS public.refuelling_logs_id_seq TO authenticated;
