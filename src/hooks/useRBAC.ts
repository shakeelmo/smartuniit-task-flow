
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';
export type PermissionType = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type AppModule = 'users' | 'customers' | 'projects' | 'tasks' | 'quotations' | 'invoices' | 'proposals' | 'dashboard' | 'settings';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: AppRole;
  module: AppModule;
  permission: PermissionType;
  created_at: string;
}

export const useRBAC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentUserRole, setCurrentUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);

  // Fetch current user's role
  const fetchUserRole = async () => {
    if (!user) {
      setCurrentUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: user.id
      });

      if (error) throw error;
      setCurrentUserRole(data as AppRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Default to viewer if no role found
      setCurrentUserRole('viewer');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all role permissions
  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  // Check if user has specific permission
  const hasPermission = async (module: AppModule, permission: PermissionType): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        module_name: module,
        permission_name: permission
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Check if user is admin or higher
  const isAdminOrHigher = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('is_admin_or_higher', {
        user_id: user.id
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Assign role to user (admin only)
  const assignRole = async (userId: string, role: AppRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_by: user?.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`,
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get all users with their roles (admin only)
  const getUsersWithRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles!user_roles_user_id_fkey(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchPermissions();
  }, [user]);

  return {
    currentUserRole,
    loading,
    permissions,
    hasPermission,
    isAdminOrHigher,
    assignRole,
    getUsersWithRoles,
    refetchUserRole: fetchUserRole
  };
};
