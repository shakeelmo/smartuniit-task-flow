
-- Add customer_logo_url column to proposals table
ALTER TABLE public.proposals 
ADD COLUMN customer_logo_url TEXT DEFAULT NULL;
