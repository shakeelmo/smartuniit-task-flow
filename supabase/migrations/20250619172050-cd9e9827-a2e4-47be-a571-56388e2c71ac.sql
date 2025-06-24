
-- Add unique constraint on the number column for quotations table
ALTER TABLE public.quotations ADD CONSTRAINT quotations_number_unique UNIQUE (number);
