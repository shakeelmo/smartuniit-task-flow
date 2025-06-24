
-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'viewer');

-- Create enum for permission types
CREATE TYPE public.permission_type AS ENUM ('create', 'read', 'update', 'delete', 'manage');

-- Create enum for modules/resources
CREATE TYPE public.app_module AS ENUM ('users', 'customers', 'projects', 'tasks', 'quotations', 'invoices', 'proposals', 'dashboard', 'settings');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create role_permissions table
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    module app_module NOT NULL,
    permission permission_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, module, permission)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
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

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.get_user_role(auth.uid()) = 'super_admin');

-- Create RLS policies for role_permissions
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (public.get_user_role(auth.uid()) = 'super_admin');

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assign default viewer role to existing users and new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();
