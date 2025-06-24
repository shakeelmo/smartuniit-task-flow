
import React, { useState, useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CustomerManagement = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('customers');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Use optimized hook with pagination and filtering
  const { 
    customers, 
    loading, 
    totalCount, 
    hasMore, 
    refetch: refetchCustomers 
  } = useCustomers(currentPage, pageSize, searchTerm, statusFilter);

  const { followUps, refetch: refetchFollowUps } = useFollowUps();

  // Cache customer statistics with React Query to reduce API calls
  const { data: customerStats } = useQuery({
    queryKey: ['customer-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('status', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const active = data?.filter(c => c.status === 'active').length || 0;
      const prospects = data?.filter(c => c.status === 'prospect').length || 0;
      const clients = data?.filter(c => c.status === 'client').length || 0;
      
      return { total, active, prospects, clients };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!user
  });

  // Cache follow-up statistics
  const { data: followUpStats } = useQuery({
    queryKey: ['followup-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('follow_ups')
        .select('status', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const pending = data?.filter(f => f.status === 'pending').length || 0;
      const overdue = data?.filter(f => f.status === 'overdue').length || 0;
      
      return { pending, overdue };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!user
  });

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Memoize statistics to prevent unnecessary re-renders
  const statistics = useMemo(() => {
    return {
      totalCustomers: customerStats?.total || 0,
      activeCustomers: customerStats?.active || 0,
      prospects: customerStats?.prospects || 0,
      clients: customerStats?.clients || 0,
      pendingFollowUps: followUpStats?.pending || 0,
      overdueFollowUps: followUpStats?.overdue || 0
    };
  }, [customerStats, followUpStats]);

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
          <div className="text-2xl font-bold text-blue-600">{statistics.totalCustomers}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{statistics.activeCustomers}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{statistics.prospects}</div>
          <div className="text-sm text-gray-600">Prospects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{statistics.clients}</div>
          <div className="text-sm text-gray-600">Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{statistics.pendingFollowUps}</div>
          <div className="text-sm text-gray-600">Pending Follow-ups</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{statistics.overdueFollowUps}</div>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
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
            customers={customers}
            loading={loading}
            onCreateFollowUp={handleCreateFollowUp}
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            hasMore={hasMore}
            onPageChange={handlePageChange}
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
