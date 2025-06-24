
import { useQuery } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/contexts/AuthContext';

// Cache duration: 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;

export const useCachedRBAC = () => {
  const { user } = useAuth();
  const rbac = useRBAC();
  
  // Cache user permissions with React Query
  const { data: cachedPermissions } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Return current permissions state
      return {
        currentUserRole: rbac.currentUserRole,
        loading: rbac.loading,
        permissions: rbac.permissions,
        hasPermission: rbac.hasPermission,
        isAdminOrHigher: rbac.isAdminOrHigher,
        assignRole: rbac.assignRole,
        getUsersWithRoles: rbac.getUsersWithRoles,
        refetchUserRole: rbac.refetchUserRole,
        hasConnectionError: rbac.hasConnectionError,
        isOfflineMode: rbac.isOfflineMode
      };
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2, // Keep in cache for 30 minutes
    enabled: !!user && !rbac.loading,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if cache is fresh
  });

  // Return cached permissions if available, otherwise fallback to real-time RBAC
  return cachedPermissions || rbac;
};
