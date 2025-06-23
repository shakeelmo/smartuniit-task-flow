
-- Add the missing duration_of_project column to the proposals table
ALTER TABLE public.proposals 
ADD COLUMN duration_of_project INTEGER;

-- Update the column to allow nullable values since existing records won't have this data
COMMENT ON COLUMN public.proposals.duration_of_project IS 'Project duration in days';
