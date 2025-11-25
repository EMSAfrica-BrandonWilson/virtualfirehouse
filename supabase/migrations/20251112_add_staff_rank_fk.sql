-- Create index on staff_basic_info.rank_id for performance
CREATE INDEX IF NOT EXISTS idx_staff_basic_info_rank_id
  ON public.staff_basic_info(rank_id);

-- Drop existing FK if present, then add the correct FK to public.ranks(id)
ALTER TABLE public.staff_basic_info
  DROP CONSTRAINT IF EXISTS staff_basic_info_rank_id_fkey;

ALTER TABLE public.staff_basic_info
  ADD CONSTRAINT staff_basic_info_rank_id_fkey
  FOREIGN KEY (rank_id)
  REFERENCES public.ranks(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL;