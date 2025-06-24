
-- Create proposals table to store main proposal information
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Proposal Cover
  project_name TEXT,
  reference_number TEXT,
  client_company_name TEXT,
  client_address TEXT,
  client_contact_person TEXT,
  client_email TEXT,
  client_phone TEXT,
  company_name TEXT,
  company_contact_details TEXT,
  submission_date DATE,
  client_logo_url TEXT,
  company_logo_url TEXT,
  
  -- Executive Summary
  executive_summary TEXT,
  key_objectives TEXT,
  why_choose_us TEXT,
  
  -- Problem Statement
  problem_description TEXT,
  background_context TEXT,
  
  -- Approach/Solution
  proposed_solution TEXT,
  strategy_method TEXT,
  
  -- About Us/Team
  company_bio TEXT,
  team_photo_url TEXT,
  team_bios JSONB DEFAULT '[]'::jsonb,
  
  -- Terms & Conditions
  terms_conditions TEXT,
  call_to_action TEXT DEFAULT 'Contact Us',
  
  -- Optional sections
  abstract TEXT,
  table_of_contents BOOLEAN DEFAULT false,
  glossary TEXT,
  appendix TEXT
);

-- Create deliverables table
CREATE TABLE public.proposal_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timeline table
CREATE TABLE public.proposal_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  phase_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  completion_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget items table
CREATE TABLE public.proposal_budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'Each',
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case studies table
CREATE TABLE public.proposal_case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  testimonial TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_case_studies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for proposals
CREATE POLICY "Users can view their own proposals" 
  ON public.proposals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proposals" 
  ON public.proposals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals" 
  ON public.proposals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
  ON public.proposals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for deliverables
CREATE POLICY "Users can manage deliverables for their proposals" 
  ON public.proposal_deliverables 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_deliverables.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Create RLS policies for timeline
CREATE POLICY "Users can manage timeline for their proposals" 
  ON public.proposal_timeline 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_timeline.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Create RLS policies for budget items
CREATE POLICY "Users can manage budget items for their proposals" 
  ON public.proposal_budget_items 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_budget_items.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Create RLS policies for case studies
CREATE POLICY "Users can manage case studies for their proposals" 
  ON public.proposal_case_studies 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_case_studies.proposal_id 
    AND proposals.user_id = auth.uid()
  ));

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposals table
CREATE TRIGGER handle_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
