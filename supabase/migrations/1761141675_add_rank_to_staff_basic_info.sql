-- Add rank_id field to staff_basic_info table
ALTER TABLE public.staff_basic_info 
ADD COLUMN IF NOT EXISTS rank_id UUID REFERENCES public.ranks(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_basic_info_rank_id ON public.staff_basic_info(rank_id);

-- Add comment to document the field
COMMENT ON COLUMN public.staff_basic_info.rank_id IS 'Foreign key reference to ranks table for employee rank assignment';
