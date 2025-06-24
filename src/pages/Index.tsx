
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import UserManagement from "@/components/UserManagement";
import RoleManagement from "@/components/RoleManagement";
import ProjectManagement from "@/components/ProjectManagement";
import TaskManagement from "@/components/TaskManagement";
import QuotationManagement from "@/components/QuotationManagement";
import InvoiceManagement from "@/components/InvoiceManagement";
import ProposalManagement from "@/components/ProposalManagement";
import CustomerManagement from "@/components/CustomerManagement";
import { RBACDebugPanel } from "@/components/rbac/RBACDebugPanel";

const Index = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");
  
  // Show debug panel if debug=true in URL
  const showDebug = searchParams.get('debug') === 'true';

  useEffect(() => {
    const path = location.pathname.slice(1);
    if (path) {
      setActiveModule(path);
    } else {
      setActiveModule("dashboard");
    }
  }, [location]);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      case "projects":
        return <ProjectManagement />;
      case "tasks":
        return <TaskManagement />;
      case "quotations":
        return <QuotationManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "proposals":
        return <ProposalManagement />;
      case "customers":
        return <CustomerManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <div className="flex-1 lg:ml-0 ml-0 p-4 lg:p-6 overflow-auto">
          <div className="pt-16 lg:pt-0">
            {/* Debug Panel */}
            {showDebug && (
              <div className="mb-6">
                <RBACDebugPanel />
              </div>
            )}
            
            {renderActiveModule()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
