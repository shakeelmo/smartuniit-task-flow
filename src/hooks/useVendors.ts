
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Vendor, CreateVendorData, UpdateVendorData } from '@/types/vendor';

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVendors = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async (vendorData: CreateVendorData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('vendors')
        .insert([{ ...vendorData, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor created successfully",
      });

      fetchVendors();
      return true;
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateVendor = async (id: string, vendorData: UpdateVendorData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });

      fetchVendors();
      return true;
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteVendor = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });

      fetchVendors();
      return true;
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [user]);

  return {
    vendors,
    loading,
    createVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors,
  };
};
