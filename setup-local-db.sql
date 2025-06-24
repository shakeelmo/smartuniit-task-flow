-- SmartUniit Local Database Setup Script
-- This script sets up the complete database schema for local development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'viewer');

-- Create enum for permission types
CREATE TYPE public.permission_type AS ENUM ('create', 'read', 'update', 'delete', 'manage');

-- Create enum for modules/resources
CREATE TYPE public.app_module AS ENUM ('users', 'customers', 'projects', 'tasks', 'quotations', 'invoices', 'proposals', 'dashboard', 'settings');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    company_name TEXT,
    position TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company_name TEXT,
    industry TEXT,
    website TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    team_members TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    quotation_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    total_amount DECIMAL(15,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    valid_until DATE,
    terms_and_conditions TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotation_sections table
CREATE TABLE public.quotation_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotation_line_items table
CREATE TABLE public.quotation_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.quotation_sections(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposals table
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    proposal_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    executive_summary TEXT,
    project_overview TEXT,
    technical_approach TEXT,
    timeline TEXT,
    deliverables TEXT,
    terms_and_conditions TEXT,
    payment_terms TEXT,
    bank_details TEXT,
    status TEXT DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_budget_items table
CREATE TABLE public.proposal_budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) DEFAULT 0,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_case_studies table
CREATE TABLE public.proposal_case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    industry TEXT,
    results TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_commercial_items table
CREATE TABLE public.proposal_commercial_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    value DECIMAL(15,2) DEFAULT 0,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_deliverables table
CREATE TABLE public.proposal_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    phase TEXT,
    timeline TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_timeline table
CREATE TABLE public.proposal_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create proposal_versions table
CREATE TABLE public.proposal_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(proposal_id, version_number)
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    total_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    due_date DATE,
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoice_line_items table
CREATE TABLE public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create role_permissions table
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role app_role NOT NULL,
    module app_module NOT NULL,
    permission permission_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, module, permission)
);

-- Create data_backups table
CREATE TABLE public.data_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    backup_name TEXT NOT NULL,
    backup_type TEXT NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create error_logs table
CREATE TABLE public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_customer_id ON public.tasks(customer_id);
CREATE INDEX idx_quotations_user_id ON public.quotations(user_id);
CREATE INDEX idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX idx_quotation_line_items_quotation_id ON public.quotation_line_items(quotation_id);
CREATE INDEX idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX idx_follow_ups_customer_id ON public.follow_ups(customer_id);
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_customer_id ON public.proposals(customer_id);
CREATE INDEX idx_proposals_quotation_id ON public.proposals(quotation_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotation_sections_updated_at BEFORE UPDATE ON public.quotation_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotation_line_items_updated_at BEFORE UPDATE ON public.quotation_line_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_budget_items_updated_at BEFORE UPDATE ON public.proposal_budget_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_case_studies_updated_at BEFORE UPDATE ON public.proposal_case_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_commercial_items_updated_at BEFORE UPDATE ON public.proposal_commercial_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_deliverables_updated_at BEFORE UPDATE ON public.proposal_deliverables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_timeline_updated_at BEFORE UPDATE ON public.proposal_timeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoice_line_items_updated_at BEFORE UPDATE ON public.invoice_line_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default role permissions
INSERT INTO public.role_permissions (role, module, permission) VALUES
-- Super Admin - full access to everything
('super_admin', 'users', 'create'),
('super_admin', 'users', 'read'),
('super_admin', 'users', 'update'),
('super_admin', 'users', 'delete'),
('super_admin', 'users', 'manage'),
('super_admin', 'customers', 'create'),
('super_admin', 'customers', 'read'),
('super_admin', 'customers', 'update'),
('super_admin', 'customers', 'delete'),
('super_admin', 'customers', 'manage'),
('super_admin', 'projects', 'create'),
('super_admin', 'projects', 'read'),
('super_admin', 'projects', 'update'),
('super_admin', 'projects', 'delete'),
('super_admin', 'projects', 'manage'),
('super_admin', 'tasks', 'create'),
('super_admin', 'tasks', 'read'),
('super_admin', 'tasks', 'update'),
('super_admin', 'tasks', 'delete'),
('super_admin', 'tasks', 'manage'),
('super_admin', 'quotations', 'create'),
('super_admin', 'quotations', 'read'),
('super_admin', 'quotations', 'update'),
('super_admin', 'quotations', 'delete'),
('super_admin', 'quotations', 'manage'),
('super_admin', 'invoices', 'create'),
('super_admin', 'invoices', 'read'),
('super_admin', 'invoices', 'update'),
('super_admin', 'invoices', 'delete'),
('super_admin', 'invoices', 'manage'),
('super_admin', 'proposals', 'create'),
('super_admin', 'proposals', 'read'),
('super_admin', 'proposals', 'update'),
('super_admin', 'proposals', 'delete'),
('super_admin', 'proposals', 'manage'),
('super_admin', 'dashboard', 'read'),
('super_admin', 'settings', 'manage'),

-- Admin - most access except user management
('admin', 'customers', 'create'),
('admin', 'customers', 'read'),
('admin', 'customers', 'update'),
('admin', 'customers', 'delete'),
('admin', 'projects', 'create'),
('admin', 'projects', 'read'),
('admin', 'projects', 'update'),
('admin', 'projects', 'delete'),
('admin', 'tasks', 'create'),
('admin', 'tasks', 'read'),
('admin', 'tasks', 'update'),
('admin', 'tasks', 'delete'),
('admin', 'quotations', 'create'),
('admin', 'quotations', 'read'),
('admin', 'quotations', 'update'),
('admin', 'quotations', 'delete'),
('admin', 'invoices', 'create'),
('admin', 'invoices', 'read'),
('admin', 'invoices', 'update'),
('admin', 'invoices', 'delete'),
('admin', 'proposals', 'create'),
('admin', 'proposals', 'read'),
('admin', 'proposals', 'update'),
('admin', 'proposals', 'delete'),
('admin', 'dashboard', 'read'),
('admin', 'users', 'read'),

-- Manager - can manage projects, tasks, and view most data
('manager', 'customers', 'read'),
('manager', 'projects', 'create'),
('manager', 'projects', 'read'),
('manager', 'projects', 'update'),
('manager', 'tasks', 'create'),
('manager', 'tasks', 'read'),
('manager', 'tasks', 'update'),
('manager', 'quotations', 'create'),
('manager', 'quotations', 'read'),
('manager', 'quotations', 'update'),
('manager', 'invoices', 'read'),
('manager', 'proposals', 'create'),
('manager', 'proposals', 'read'),
('manager', 'proposals', 'update'),
('manager', 'dashboard', 'read'),

-- Employee - can create and edit assigned work
('employee', 'customers', 'read'),
('employee', 'projects', 'read'),
('employee', 'tasks', 'create'),
('employee', 'tasks', 'read'),
('employee', 'tasks', 'update'),
('employee', 'quotations', 'create'),
('employee', 'quotations', 'read'),
('employee', 'proposals', 'create'),
('employee', 'proposals', 'read'),
('employee', 'dashboard', 'read'),

-- Viewer - read-only access
('viewer', 'customers', 'read'),
('viewer', 'projects', 'read'),
('viewer', 'tasks', 'read'),
('viewer', 'quotations', 'read'),
('viewer', 'invoices', 'read'),
('viewer', 'proposals', 'read'),
('viewer', 'dashboard', 'read');

-- Create a default super admin user
INSERT INTO public.profiles (id, email, full_name) 
VALUES ('cc0a8939-fedb-45c6-b623-b2699162a600', 'admin@smartuniit.com', 'Super Admin')
ON CONFLICT (id) DO NOTHING;

-- Assign super_admin role to the default user
INSERT INTO public.user_roles (user_id, role, assigned_by, is_active)
VALUES ('cc0a8939-fedb-45c6-b623-b2699162a600', 'super_admin', 'cc0a8939-fedb-45c6-b623-b2699162a600', true)
ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    assigned_by = 'cc0a8939-fedb-45c6-b623-b2699162a600',
    assigned_at = now(),
    updated_at = now();

-- Also deactivate any lower-level roles for this user to avoid conflicts
UPDATE public.user_roles 
SET is_active = false 
WHERE user_id = 'cc0a8939-fedb-45c6-b623-b2699162a600' 
AND role != 'super_admin';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND is_active = true 
    ORDER BY 
        CASE role
            WHEN 'super_admin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'manager' THEN 3
            WHEN 'employee' THEN 4
            WHEN 'viewer' THEN 5
        END
    LIMIT 1;
$$;

-- Create a function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, module_name app_module, permission_name permission_type)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = $1 
        AND ur.is_active = true
        AND rp.module = $2 
        AND rp.permission = $3
    );
$$;

-- Create a function to check if user is admin or higher
CREATE OR REPLACE FUNCTION public.is_admin_or_higher(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 
        AND is_active = true
        AND role IN ('super_admin', 'admin')
    );
$$;

COMMIT; 