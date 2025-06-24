
-- Add quotation_data column to proposals table to store quotation information as JSONB
ALTER TABLE public.proposals 
ADD COLUMN quotation_data JSONB DEFAULT NULL;
