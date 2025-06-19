
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ProjectManagement from "@/components/ProjectManagement";
import TaskManagement from "@/components/TaskManagement";
import UserManagement from "@/components/UserManagement";
import QuotationManagement from "@/components/QuotationManagement";
import InvoiceManagement from "@/components/InvoiceManagement";
import ProposalManagement from "@/components/ProposalManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

const Index = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SmartUni IT</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your dashboard</p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (location.pathname) {
      case "/":
        return <Dashboard />;
      case "/projects":
        return <ProjectManagement />;
      case "/tasks":
        return <TaskManagement />;
      case "/users":
        return <UserManagement />;
      case "/quotations":
        return <QuotationManagement />;
      case "/invoices":
        return <InvoiceManagement />;
      case "/proposals":
        return <ProposalManagement />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/projects":
        return "Project Management";
      case "/tasks":
        return "Task Management";
      case "/users":
        return "User Management";
      case "/quotations":
        return "Quotation Management";
      case "/invoices":
        return "Invoice Management";
      case "/proposals":
        return "Proposal Management";
      default:
        return "Dashboard";
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.first_name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
