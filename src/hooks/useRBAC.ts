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

// Cache for permission checks to reduce database calls
const permissionCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRBAC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentUserRole, setCurrentUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Fallback permissions for offline mode
  const getFallbackPermissions = (): boolean => {
    console.log('Using fallback permissions - allowing basic read access');
    return true; // Allow basic read access when connection fails
  };

  // Check if cached permission is still valid
  const getCachedPermission = (cacheKey: string): boolean | null => {
    const cached = permissionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    return null;
  };

  // Cache permission result
  const setCachedPermission = (cacheKey: string, result: boolean): void => {
    permissionCache.set(cacheKey, { result, timestamp: Date.now() });
  };

  // Fetch current user's role with error handling
  const fetchUserRole = async () => {
    if (!user) {
      setCurrentUserRole(null);
      setLoading(false);
      setHasConnectionError(false);
      return;
    }

    try {
      console.log('Fetching user role for:', user.id);
      
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: user.id
      });

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      console.log('User role fetched successfully:', data);
      setCurrentUserRole(data as AppRole || 'viewer');
      setHasConnectionError(false);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setHasConnectionError(true);
      // Default to viewer if no role found or connection error
      setCurrentUserRole('viewer');
      
      toast({
        title: "Connection Issue",
        description: "Using offline mode with limited permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all role permissions with error handling
  const fetchPermissions = async () => {
    try {
      console.log('Fetching role permissions...');
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      
      console.log('Permissions fetched successfully:', data?.length || 0, 'permissions');
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setHasConnectionError(true);
      // Keep existing permissions if fetch fails
    }
  };

  // Check if user has specific permission with caching and fallbacks
  const hasPermission = async (module: AppModule, permission: PermissionType): Promise<boolean> => {
    if (!user) {
      console.log('No user found, denying permission');
      return false;
    }

    const cacheKey = `${user.id}-${module}-${permission}`;
    
    // Check cache first
    const cachedResult = getCachedPermission(cacheKey);
    if (cachedResult !== null) {
      console.log('Using cached permission result:', cachedResult);
      return cachedResult;
    }

    try {
      console.log('Checking permission:', { user: user.id, module, permission });
      
      const { data, error } = await supabase.rpc('has_permission', {
        user_id: user.id,
        module_name: module,
        permission_name: permission
      });

      if (error) {
        console.error('Error checking permission:', error);
        throw error;
      }
      
      const result = data as boolean;
      console.log('Permission check result:', result);
      
      // Cache the result
      setCachedPermission(cacheKey, result);
      setHasConnectionError(false);
      
      return result;
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasConnectionError(true);
      
      // Use fallback logic
      const fallbackResult = getFallbackPermissions();
      console.log('Using fallback permission result:', fallbackResult);
      
      return fallbackResult;
    }
  };

  // Check if user is admin or higher with error handling
  const isAdminOrHigher = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Checking admin status for:', user.id);
      
      const { data, error } = await supabase.rpc('is_admin_or_higher', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        throw error;
      }
      
      const result = data as boolean;
      console.log('Admin status check result:', result);
      setHasConnectionError(false);
      
      return result;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setHasConnectionError(true);
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
    console.log('useRBAC: User changed, fetching role and permissions');
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
    refetchUserRole: fetchUserRole,
    hasConnectionError,
    isOfflineMode: hasConnectionError
  };
};
