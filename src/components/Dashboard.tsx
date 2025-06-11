
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      icon: FolderOpen,
      change: '+2 this week',
      color: 'text-blue-600'
    },
    {
      title: 'Total Tasks',
      value: '48',
      icon: CheckSquare,
      change: '+8 today',
      color: 'text-green-600'
    },
    {
      title: 'Team Members',
      value: '8',
      icon: Users,
      change: '+1 this month',
      color: 'text-purple-600'
    },
    {
      title: 'Overdue Tasks',
      value: '3',
      icon: AlertTriangle,
      change: '-2 from yesterday',
      color: 'text-red-600'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      status: 'In Progress',
      progress: 75,
      assignee: 'Ahmed Al-Rashid',
      role: 'Manager',
      dueDate: '2024-06-15'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      status: 'Planning',
      progress: 25,
      assignee: 'Sara Al-Mahmoud',
      role: 'Technician',
      dueDate: '2024-07-01'
    },
    {
      id: 3,
      name: 'Database Migration',
      status: 'Review',
      progress: 90,
      assignee: 'Mohammed Al-Faisal',
      role: 'Technician',
      dueDate: '2024-06-12'
    }
  ];

  const recentTasks = [
    {
      id: 1,
      title: 'Update landing page design',
      project: 'Website Redesign',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Ahmed Al-Rashid'
    },
    {
      id: 2,
      title: 'Setup CI/CD pipeline',
      project: 'Mobile App Development',
      status: 'To Do',
      priority: 'Medium',
      assignee: 'Sara Al-Mahmoud'
    },
    {
      id: 3,
      title: 'Data backup verification',
      project: 'Database Migration',
      status: 'Done',
      priority: 'High',
      assignee: 'Mohammed Al-Faisal'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'To Do': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Recent Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{project.assignee} • {project.role}</span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5" />
              <span>Recent Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Project: {task.project}</p>
                  <p className="text-sm text-gray-500">Assigned to: {task.assignee}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
