
import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, WifiOff, Shield } from 'lucide-react';

export const RBACDebugPanel = () => {
  const { 
    currentUserRole, 
    loading, 
    permissions, 
    hasConnectionError, 
    isOfflineMode 
  } = useRBAC();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          RBAC System Status
          {loading ? (
            <Clock className="h-4 w-4 text-yellow-500" />
          ) : hasConnectionError ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Role:</label>
          <Badge variant={currentUserRole ? "default" : "secondary"} className="ml-2">
            {currentUserRole ? currentUserRole.replace('_', ' ').toUpperCase() : 'Loading...'}
          </Badge>
        </div>
        
        <div>
          <label className="text-sm font-medium">Permissions Loaded:</label>
          <Badge variant={permissions.length > 0 ? "default" : "secondary"} className="ml-2">
            {permissions.length} permissions
          </Badge>
        </div>
        
        <div>
          <label className="text-sm font-medium">Connection Status:</label>
          <Badge 
            variant={loading ? "secondary" : hasConnectionError ? "destructive" : "default"} 
            className="ml-2"
          >
            {loading ? 'Loading' : hasConnectionError ? 'Connection Error' : 'Connected'}
          </Badge>
        </div>

        {isOfflineMode && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Running in offline mode with emergency fallback permissions
            </AlertDescription>
          </Alert>
        )}

        {currentUserRole && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              RBAC system is working correctly with role: {currentUserRole}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
