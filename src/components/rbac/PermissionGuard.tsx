
import React, { useState, useEffect } from 'react';
import { useRBAC, AppModule, PermissionType } from '@/hooks/useRBAC';

interface PermissionGuardProps {
  module: AppModule;
  permission: PermissionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission, loading } = useRBAC();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      setCheckingPermission(true);
      const access = await hasPermission(module, permission);
      setHasAccess(access);
      setCheckingPermission(false);
    };

    checkAccess();
  }, [module, permission, hasPermission, loading]);

  if (loading || checkingPermission) {
    return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
