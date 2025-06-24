
-- Step 1: Assign viewer role to current user (and any existing users without roles)
INSERT INTO public.user_roles (user_id, role, assigned_by, is_active)
SELECT 
    au.id,
    'viewer'::app_role,
    au.id, -- self-assigned for existing users
    true
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id AND ur.is_active = true
WHERE ur.user_id IS NULL;

-- Step 2: Update the automatic role assignment function to handle existing users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only insert if user doesn't already have an active role
    INSERT INTO public.user_roles (user_id, role, assigned_by, is_active)
    SELECT NEW.id, 'viewer'::app_role, NEW.id, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = NEW.id AND is_active = true
    );
    RETURN NEW;
END;
$$;

-- Step 3: Create a function to get user role with fallback
CREATE OR REPLACE FUNCTION public.get_user_role_with_fallback(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.user_roles 
         WHERE user_roles.user_id = $1 AND is_active = true 
         ORDER BY 
             CASE role
                 WHEN 'super_admin' THEN 1
                 WHEN 'admin' THEN 2
                 WHEN 'manager' THEN 3
                 WHEN 'employee' THEN 4
                 WHEN 'viewer' THEN 5
             END
         LIMIT 1),
        'viewer'::app_role  -- Fallback to viewer if no role found
    );
$$;

-- Step 4: Create a permission check function with emergency fallback
CREATE OR REPLACE FUNCTION public.has_permission_with_fallback(user_id UUID, module_name app_module, permission_name permission_type)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.role_permissions rp ON ur.role = rp.role
            WHERE ur.user_id = $1 
            AND ur.is_active = true
            AND rp.module = $2 
            AND rp.permission = $3
        ) THEN true
        WHEN $3 = 'read'::permission_type AND $2 IN ('dashboard'::app_module, 'customers'::app_module, 'projects'::app_module, 'tasks'::app_module) THEN true  -- Emergency fallback for basic read access
        ELSE false
    END;
$$;
