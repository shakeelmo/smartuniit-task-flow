
-- Add new columns to proposals table for document control and enhanced features
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS version_number text DEFAULT '1.0';
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS document_reviewers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS confidentiality_included boolean DEFAULT true;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS understanding_requirements text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS customer_prerequisites text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS payment_terms text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS project_duration_days integer;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS bank_details jsonb;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_signature_data text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS company_signature_data text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS signature_date date;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS is_bilingual boolean DEFAULT false;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS template_customization jsonb DEFAULT '{}'::jsonb;

-- Create version history table
CREATE TABLE IF NOT EXISTS public.proposal_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  change_summary text,
  reviewer_name text,
  review_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create enhanced deliverables table with categories
ALTER TABLE public.proposal_deliverables ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE public.proposal_deliverables ADD COLUMN IF NOT EXISTS is_collapsible boolean DEFAULT false;
ALTER TABLE public.proposal_deliverables ADD COLUMN IF NOT EXISTS sub_tasks jsonb DEFAULT '[]'::jsonb;

-- Create commercial items table for detailed itemized pricing
CREATE TABLE IF NOT EXISTS public.proposal_commercial_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE,
  serial_number integer NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'Each',
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_commercial_items ENABLE ROW LEVEL SECURITY;

-- Policies for proposal_versions
CREATE POLICY "Users can view proposal versions" 
  ON public.proposal_versions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create proposal versions" 
  ON public.proposal_versions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update proposal versions" 
  ON public.proposal_versions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete proposal versions" 
  ON public.proposal_versions 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Policies for proposal_commercial_items
CREATE POLICY "Users can view commercial items" 
  ON public.proposal_commercial_items 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_commercial_items.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create commercial items" 
  ON public.proposal_commercial_items 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_commercial_items.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update commercial items" 
  ON public.proposal_commercial_items 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_commercial_items.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete commercial items" 
  ON public.proposal_commercial_items 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_commercial_items.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Add trigger for updated_at on new tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.proposal_versions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.proposal_commercial_items
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
