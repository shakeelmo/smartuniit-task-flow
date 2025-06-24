
-- Assign super_admin role to Shakeel Mohammed
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
