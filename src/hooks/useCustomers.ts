
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer, CreateCustomerData } from '@/types/customer';

export const useCustomers = (page: number = 1, pageSize: number = 20, searchTerm: string = '', statusFilter: string = 'all') => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Build query with specific field selection (no select('*'))
      let query = supabase
        .from('customers')
        .select(`
          id,
          customer_name,
          company_name,
          contact_person,
          email,
          phone,
          address,
          industry,
          project_interest,
          status,
          created_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Apply search filter at database level
      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply status filter at database level
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Type assertion to ensure proper types from database
      const typedCustomers = (data || []).map(customer => ({
        ...customer,
        status: customer.status as 'active' | 'inactive' | 'prospect' | 'client',
        // Add placeholder values for fields not fetched
        notes: '',
        updated_at: customer.created_at,
        user_id: ''
      })) as Customer[];
      
      setCustomers(typedCustomers);
      setTotalCount(count || 0);
      setHasMore((count || 0) > offset + pageSize);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCustomer = async (customerData: CreateCustomerData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save customers",
          variant: "destructive"
        });
        return false;
      }

      const customerRecord = {
        user_id: userData.user.id,
        ...customerData
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerRecord);

      if (error) throw error;

      await fetchCustomers();
      toast({
        title: "Success",
        description: "Customer saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, searchTerm, statusFilter]);

  return {
    customers,
    loading,
    totalCount,
    hasMore,
    saveCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};
