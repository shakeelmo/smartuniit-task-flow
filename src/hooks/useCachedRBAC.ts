
import { useQuery } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';

// Cache duration: 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;

export const useCachedRBAC = () => {
  const rbac = useRBAC();
  
  // Cache user permissions with React Query
  const { data: cachedPermissions } = useQuery({
    queryKey: ['user-permissions', rbac.user?.id],
    queryFn: async () => {
      if (!rbac.user) return null;
      
      // Return current permissions state
      return {
        hasRole: rbac.hasRole,
        hasPermission: rbac.hasPermission,
        canAccess: rbac.canAccess,
        userRole: rbac.userRole,
        isLoading: rbac.isLoading
      };
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2, // Keep in cache for 30 minutes
    enabled: !!rbac.user && !rbac.isLoading,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if cache is fresh
  });

  // Return cached permissions if available, otherwise fallback to real-time RBAC
  return cachedPermissions || rbac;
};
