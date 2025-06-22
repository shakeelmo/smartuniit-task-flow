
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  FileText, 
  Receipt,
  Presentation,
  Database,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'customers', label: 'Customer Database', icon: Database, path: '/customers' },
    { id: 'users', label: 'User Management', icon: Users, path: '/users' },
    { id: 'projects', label: 'Project Management', icon: FolderOpen, path: '/projects' },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare, path: '/tasks' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/quotations' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
    { id: 'proposals', label: 'Proposals', icon: Presentation, path: '/proposals' },
  ];

  const handleModuleClick = (moduleId: string, path: string) => {
    onModuleChange(moduleId);
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-smart-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SM</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Smart Management</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive 
                  ? "bg-smart-orange text-white hover:bg-smart-orange/90" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleModuleClick(module.id, module.path)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {module.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-gray-700 hover:bg-gray-100"
          onClick={() => {}}
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};
