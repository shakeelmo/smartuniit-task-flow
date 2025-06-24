
import React, { useState } from 'react';
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
  LogOut,
  Shield,
  Menu,
  X,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';
import { useRBAC } from '@/hooks/useRBAC';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const { isOfflineMode, hasConnectionError } = useRBAC();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', module: 'dashboard' as const, permission: 'read' as const },
    { id: 'customers', label: 'Customer Database', icon: Database, path: '/customers', module: 'customers' as const, permission: 'read' as const },
    { id: 'users', label: 'User Management', icon: Users, path: '/users', module: 'users' as const, permission: 'read' as const },
    { id: 'roles', label: 'Role Management', icon: Shield, path: '/roles', module: 'users' as const, permission: 'manage' as const },
    { id: 'projects', label: 'Project Management', icon: FolderOpen, path: '/projects', module: 'projects' as const, permission: 'read' as const },
    { id: 'tasks', label: 'Task Management', icon: CheckSquare, path: '/tasks', module: 'tasks' as const, permission: 'read' as const },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/quotations', module: 'quotations' as const, permission: 'read' as const },
    { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/invoices', module: 'invoices' as const, permission: 'read' as const },
    { id: 'proposals', label: 'Proposals', icon: Presentation, path: '/proposals', module: 'proposals' as const, permission: 'read' as const },
  ];

  const handleModuleClick = (moduleId: string, path: string) => {
    onModuleChange(moduleId);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col h-screen transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-smart-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Smart Management</span>
            {isOfflineMode && (
              <WifiOff className="h-4 w-4 text-gray-500" title="Offline mode" />
            )}
          </div>
        </div>
        
        {/* Connection Status */}
        {hasConnectionError && (
          <div className="p-4">
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Limited connectivity - some features may be unavailable
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <PermissionGuard
                key={module.id}
                module={module.module}
                permission={module.permission}
                fallback={
                  // Show disabled state instead of hiding completely
                  <Button
                    variant="ghost"
                    disabled
                    className="w-full justify-start h-12 text-gray-400 cursor-not-allowed"
                    title="Access restricted"
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{module.label}</span>
                  </Button>
                }
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${
                    isActive 
                      ? "bg-smart-orange text-white hover:bg-smart-orange/90" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleModuleClick(module.id, module.path)}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{module.label}</span>
                </Button>
              </PermissionGuard>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <PermissionGuard 
            module="settings" 
            permission="manage"
            fallback={
              <Button
                variant="ghost"
                disabled
                className="w-full justify-start h-12 text-gray-400 cursor-not-allowed"
                title="Access restricted"
              >
                <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </Button>
            }
          >
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-gray-700 hover:bg-gray-100"
              onClick={() => {}}
            >
              <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="truncate">Settings</span>
            </Button>
          </PermissionGuard>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};
