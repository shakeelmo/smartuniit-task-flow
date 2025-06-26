
-- Now add vendors module to RBAC system
INSERT INTO public.role_permissions (role, module, permission) VALUES
  ('super_admin', 'vendors', 'create'),
  ('super_admin', 'vendors', 'read'),
  ('super_admin', 'vendors', 'update'),
  ('super_admin', 'vendors', 'delete'),
  ('super_admin', 'vendors', 'manage'),
  ('admin', 'vendors', 'create'),
  ('admin', 'vendors', 'read'),
  ('admin', 'vendors', 'update'),
  ('admin', 'vendors', 'delete'),
  ('manager', 'vendors', 'create'),
  ('manager', 'vendors', 'read'),
  ('manager', 'vendors', 'update'),
  ('employee', 'vendors', 'read'),
  ('employee', 'vendors', 'create'),
  ('viewer', 'vendors', 'read')
ON CONFLICT (role, module, permission) DO NOTHING;
