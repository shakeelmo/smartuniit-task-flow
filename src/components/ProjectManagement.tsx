
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MoreVertical, 
  FolderOpen,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import ProjectDialog from '@/components/ProjectDialog';

const ProjectManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern UI/UX',
      status: 'In Progress',
      priority: 'High',
      manager: 'Ahmed Al-Rashid',
      team: ['Sara Al-Mahmoud', 'Mohammed Al-Faisal'],
      dueDate: '2024-06-15',
      progress: 75,
      tasksCount: 12,
      completedTasks: 9
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      status: 'Planning',
      priority: 'High',
      manager: 'Sara Al-Mahmoud',
      team: ['Ahmed Al-Rashid', 'Fatima Al-Zahra'],
      dueDate: '2024-07-01',
      progress: 25,
      tasksCount: 18,
      completedTasks: 4
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      status: 'Review',
      priority: 'Medium',
      manager: 'Mohammed Al-Faisal',
      team: ['Ahmed Al-Rashid'],
      dueDate: '2024-06-12',
      progress: 90,
      tasksCount: 8,
      completedTasks: 7
    },
    {
      id: 4,
      name: 'Security Audit',
      description: 'Comprehensive security assessment of all systems',
      status: 'To Do',
      priority: 'High',
      manager: 'Fatima Al-Zahra',
      team: ['Mohammed Al-Faisal', 'Sara Al-Mahmoud'],
      dueDate: '2024-06-30',
      progress: 10,
      tasksCount: 15,
      completedTasks: 1
    }
  ]);

  const handleProjectCreate = (newProject: any) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-green-100 text-green-800';
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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage and track your projects</p>
        </div>
        <ProjectDialog onProjectCreate={handleProjectCreate} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">{project.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)} variant="secondary">
                  {project.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">{project.manager}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Due:</span>
                  <span className="font-medium">{project.dueDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Tasks:</span>
                  <span className="font-medium">{project.completedTasks}/{project.tasksCount}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">Team Members:</p>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={member}
                    >
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;
