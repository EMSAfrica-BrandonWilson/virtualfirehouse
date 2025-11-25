-- Add vehicle_call_sign column to refuelling_logs table
ALTER TABLE public.refuelling_logs 
ADD COLUMN IF NOT EXISTS vehicle_call_sign VARCHAR(100);

-- Add index on vehicle_call_sign for faster queries
CREATE INDEX IF NOT EXISTS idx_refuelling_logs_call_sign ON public.refuelling_logs(vehicle_call_sign);

-- Add comment for documentation
COMMENT ON COLUMN public.refuelling_logs.vehicle_call_sign IS 'Vehicle call sign from the vehicle registration dropdown';
