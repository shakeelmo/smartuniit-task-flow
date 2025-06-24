
import React from 'react';
import { RoleManager } from '@/components/rbac/RoleManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const RoleManagement = () => {
  return (
    <ErrorBoundary>
      <RoleManager />
    </ErrorBoundary>
  );
};

export default RoleManagement;
