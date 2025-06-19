import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  Receipt, 
  PresentationChart,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';
import TaskManagement from './TaskManagement';
import QuotationManagement from './QuotationManagement';
import InvoiceManagement from './InvoiceManagement';
import ProposalManagement from './ProposalManagement';
import EditProfileDialog from './EditProfileDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', component: Dashboard },
    { icon: Users, label: 'User Management', path: '/users', component: UserManagement },
    { icon: Briefcase, label: 'Project Management', path: '/projects', component: ProjectManagement },
    { icon: CheckSquare, label: 'Task Management', path: '/tasks', component: TaskManagement },
    { icon: FileText, label: 'Quotation Management', path: '/quotations', component: QuotationManagement },
    { icon: Receipt, label: 'Invoice Management', path: '/invoices', component: InvoiceManagement },
    { icon: PresentationChart, label: 'Proposal Management', path: '/proposals', component: ProposalManagement },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      signOut();
    }
  };

  return (
    <div
      className={`flex flex-col h-screen bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Section: Logo and Collapse Button */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <span className="font-bold text-lg">Smart Universe</span>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Middle Section: Navigation Items */}
      <nav className="flex-grow p-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label} className="mb-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  // Implement navigation logic here, e.g., using react-router-dom
                  console.log(`Navigating to ${item.path}`);
                }}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section: User Profile and Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            {!isCollapsed && <div>
              <div className="font-medium">{user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>}
          </div>
          {!isCollapsed && <Button variant="ghost" size="icon" onClick={() => setEditProfileOpen(true)}>
            <User className="h-4 w-4" />
          </Button>}
        </div>
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          {isCollapsed ? <LogOut className="h-4 w-4" /> : 'Logout'}
        </Button>
      </div>

      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </div>
  );
};

export default Sidebar;
