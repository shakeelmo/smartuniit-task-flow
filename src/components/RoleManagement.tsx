
import React from 'react';
import { RoleManager } from '@/components/rbac/RoleManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useCachedRBAC } from '@/hooks/useCachedRBAC';

const RoleManagement = () => {
  const rbac = useCachedRBAC();

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {rbac.isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Loading permissions...</div>
          </div>
        )}
        <RoleManager />
      </div>
    </ErrorBoundary>
  );
};

export default RoleManagement;
