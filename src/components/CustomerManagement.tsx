
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomersList } from './customers/CustomersList';
import { FollowUpsList } from './customers/FollowUpsList';
import { CreateCustomerDialog } from './customers/CreateCustomerDialog';
import { CreateFollowUpDialog } from './customers/CreateFollowUpDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useFollowUps } from '@/hooks/useFollowUps';

const CustomerManagement = () => {
  const { user } = useAuth();
  const { customers, refetch: refetchCustomers } = useCustomers();
  const { followUps, refetch: refetchFollowUps } = useFollowUps();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('customers');

  const handleCreateCustomer = () => {
    setShowCreateDialog(true);
  };

  const handleCreateFollowUp = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
    setShowFollowUpDialog(true);
  };

  const handleCustomerCreated = () => {
    refetchCustomers();
  };

  const handleFollowUpCreated = () => {
    refetchFollowUps();
    setSelectedCustomerId('');
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const prospects = customers.filter(c => c.status === 'prospect').length;
  const clients = customers.filter(c => c.status === 'client').length;
  const pendingFollowUps = followUps.filter(f => f.status === 'pending').length;
  const overdueFollowUps = followUps.filter(f => f.status === 'overdue').length;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view customers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Database (CRM)</h1>
          <p className="text-gray-600">Manage customer relationships and follow-ups</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => handleCreateFollowUp()} variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Add Follow-Up
          </Button>
          <Button onClick={handleCreateCustomer} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{totalCustomers}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{prospects}</div>
          <div className="text-sm text-gray-600">Prospects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{clients}</div>
          <div className="text-sm text-gray-600">Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{pendingFollowUps}</div>
          <div className="text-sm text-gray-600">Pending Follow-ups</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{overdueFollowUps}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="followups" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Follow-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="prospect">Prospects</option>
                <option value="active">Active</option>
                <option value="client">Clients</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <CustomersList 
            searchTerm={searchTerm} 
            statusFilter={statusFilter}
            onCreateFollowUp={handleCreateFollowUp}
          />
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          <FollowUpsList />
        </TabsContent>
      </Tabs>

      <CreateCustomerDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCustomerCreated={handleCustomerCreated}
      />

      <CreateFollowUpDialog
        open={showFollowUpDialog}
        onOpenChange={setShowFollowUpDialog}
        selectedCustomerId={selectedCustomerId}
        onFollowUpCreated={handleFollowUpCreated}
      />
    </div>
  );
};

export default CustomerManagement;
