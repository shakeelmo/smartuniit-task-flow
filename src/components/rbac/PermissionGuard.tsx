
import React, { useState, useEffect } from 'react';
import { useRBAC, AppModule, PermissionType } from '@/hooks/useRBAC';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  module: AppModule;
  permission: PermissionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showErrorDetails?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  permission,
  children,
  fallback = null,
  showErrorDetails = false
}) => {
  const { hasPermission, loading, hasConnectionError, isOfflineMode } = useRBAC();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) {
        console.log('PermissionGuard: RBAC still loading');
        return;
      }
      
      setCheckingPermission(true);
      setPermissionError(null);
      
      try {
        console.log(`PermissionGuard: Checking permission for ${module}:${permission}`);
        const access = await hasPermission(module, permission);
        console.log(`PermissionGuard: Permission result for ${module}:${permission} = ${access}`);
        setHasAccess(access);
      } catch (error) {
        console.error('PermissionGuard: Error checking permission:', error);
        setPermissionError(error instanceof Error ? error.message : 'Permission check failed');
        
        // In case of error, allow access to prevent app breaking
        if (isOfflineMode) {
          setHasAccess(true);
          console.log('PermissionGuard: Allowing access due to offline mode');
        } else {
          setHasAccess(false);
        }
      } finally {
        setCheckingPermission(false);
      }
    };

    checkAccess();
  }, [module, permission, hasPermission, loading, isOfflineMode]);

  // Show loading state
  if (loading || checkingPermission) {
    return (
      <div className="animate-pulse bg-gray-200 h-4 w-full rounded" 
           title="Loading permissions...">
      </div>
    );
  }

  // Show error details if requested and there's an error
  if (showErrorDetails && (permissionError || hasConnectionError)) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isOfflineMode ? 'Offline mode - limited functionality' : permissionError}
        </AlertDescription>
      </Alert>
    );
  }

  // Show offline indicator for critical modules
  if (isOfflineMode && (module === 'users' || module === 'settings')) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Limited access in offline mode
        </AlertDescription>
      </Alert>
    );
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
