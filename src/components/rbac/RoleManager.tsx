
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRBAC, AppRole } from '@/hooks/useRBAC';
import { Shield, Users, Crown, Briefcase, Eye, Settings } from 'lucide-react';

const getRoleIcon = (role: AppRole) => {
  switch (role) {
    case 'super_admin': return Crown;
    case 'admin': return Shield;
    case 'manager': return Briefcase;
    case 'employee': return Users;
    case 'viewer': return Eye;
    default: return Eye;
  }
};

const getRoleColor = (role: AppRole) => {
  switch (role) {
    case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'employee': return 'bg-green-100 text-green-800 border-green-200';
    case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RoleManager = () => {
  const { currentUserRole, assignRole, getUsersWithRoles, isAdminOrHigher } = useRBAC();
  const [usersWithRoles, setUsersWithRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const adminStatus = await isAdminOrHigher();
    setIsAdmin(adminStatus);
    
    if (adminStatus) {
      const users = await getUsersWithRoles();
      setUsersWithRoles(users);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const success = await assignRole(userId, newRole);
    if (success) {
      fetchData(); // Refresh data
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to manage user roles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Badge className={getRoleColor(currentUserRole || 'viewer')}>
          Your Role: {currentUserRole?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-4">
        {usersWithRoles.map((userRole) => {
          const Icon = getRoleIcon(userRole.role);
          
          return (
            <Card key={userRole.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {userRole.profiles?.first_name?.[0] || 'U'}
                        {userRole.profiles?.last_name?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {userRole.profiles?.first_name && userRole.profiles?.last_name
                          ? `${userRole.profiles.first_name} ${userRole.profiles.last_name}`
                          : userRole.profiles?.first_name || userRole.profiles?.last_name || 'Unknown User'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {userRole.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(userRole.role)}>
                      <Icon className="h-3 w-3 mr-1" />
                      {userRole.role.replace('_', ' ').toUpperCase()}
                    </Badge>

                    {currentUserRole === 'super_admin' && (
                      <Select
                        value={userRole.role}
                        onValueChange={(newRole: AppRole) => handleRoleChange(userRole.user_id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {usersWithRoles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users with roles found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
