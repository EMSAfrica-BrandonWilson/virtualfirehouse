-- Create report_recipients table for storing eDOB report recipients
-- This table stores staff members who should receive automated PDF reports

CREATE TABLE IF NOT EXISTS public.report_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  report_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries for the same employee and report type
  CONSTRAINT unique_employee_report UNIQUE (employee_number, report_type)
);

-- Create index for faster lookups by report type
CREATE INDEX IF NOT EXISTS idx_report_recipients_report_type 
  ON public.report_recipients(report_type);

-- Create index for faster lookups by employee number
CREATE INDEX IF NOT EXISTS idx_report_recipients_employee_number 
  ON public.report_recipients(employee_number);

-- Enable Row Level Security
ALTER TABLE public.report_recipients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all recipients
CREATE POLICY "Allow authenticated users to read recipients"
  ON public.report_recipients
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert recipients
CREATE POLICY "Allow authenticated users to insert recipients"
  ON public.report_recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete recipients
CREATE POLICY "Allow authenticated users to delete recipients"
  ON public.report_recipients
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to update recipients
CREATE POLICY "Allow authenticated users to update recipients"
  ON public.report_recipients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_recipients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER trigger_update_report_recipients_updated_at
  BEFORE UPDATE ON public.report_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_report_recipients_updated_at();

-- Add comment to table
COMMENT ON TABLE public.report_recipients IS 'Stores recipients for automated eDOB PDF reports';
