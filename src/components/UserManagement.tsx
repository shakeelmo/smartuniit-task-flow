
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  
  const users = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      email: 'ahmed.rashid@smartuniit.com',
      phone: '+966 50 123 4567',
      role: 'Manager',
      department: 'Development',
      joinDate: '2023-01-15',
      lastActive: '2024-06-11',
      status: 'Active',
      projects: ['Website Redesign', 'Mobile App Development'],
      tasksCompleted: 45,
      tasksInProgress: 3
    },
    {
      id: 2,
      name: 'Sara Al-Mahmoud',
      email: 'sara.mahmoud@smartuniit.com',
      phone: '+966 55 987 6543',
      role: 'Technician',
      department: 'Development',
      joinDate: '2023-03-10',
      lastActive: '2024-06-11',
      status: 'Active',
      projects: ['Mobile App Development', 'Database Migration'],
      tasksCompleted: 32,
      tasksInProgress: 2
    },
    {
      id: 3,
      name: 'Mohammed Al-Faisal',
      email: 'mohammed.faisal@smartuniit.com',
      phone: '+966 54 456 7890',
      role: 'Technician',
      department: 'Infrastructure',
      joinDate: '2023-02-20',
      lastActive: '2024-06-10',
      status: 'Active',
      projects: ['Database Migration', 'Security Audit'],
      tasksCompleted: 28,
      tasksInProgress: 1
    },
    {
      id: 4,
      name: 'Fatima Al-Zahra',
      email: 'fatima.zahra@smartuniit.com',
      phone: '+966 56 234 5678',
      role: 'Manager',
      department: 'Security',
      joinDate: '2022-11-05',
      lastActive: '2024-06-11',
      status: 'Active',
      projects: ['Security Audit'],
      tasksCompleted: 67,
      tasksInProgress: 4
    },
    {
      id: 5,
      name: 'Omar Al-Hassan',
      email: 'omar.hassan@smartuniit.com',
      phone: '+966 53 345 6789',
      role: 'Admin',
      department: 'Administration',
      joinDate: '2022-08-15',
      lastActive: '2024-06-09',
      status: 'Active',
      projects: [],
      tasksCompleted: 89,
      tasksInProgress: 0
    }
  ];

  const roleOptions = ['All', 'Admin', 'Manager', 'Technician'];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Technician': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage team members and their roles</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roleOptions.map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(role)}
              className={selectedRole === role ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <Badge className={getRoleColor(user.role)} variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{user.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{user.joinDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  Last active: {user.lastActive}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{user.tasksCompleted}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{user.tasksInProgress}</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
              </div>

              {user.projects.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">Active Projects:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.projects.map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
