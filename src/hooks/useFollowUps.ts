
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FollowUp, CreateFollowUpData } from '@/types/customer';

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      
      // Optimized query - only fetch essential follow-up data and minimal customer info
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          id,
          user_id,
          customer_id,
          follow_up_date,
          follow_up_type,
          status,
          notes,
          completed_date,
          created_at,
          updated_at,
          customer:customers(
            customer_name,
            company_name,
            status
          )
        `)
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      
      // Type the data properly to match FollowUp interface
      const typedFollowUps = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        customer_id: item.customer_id,
        follow_up_date: item.follow_up_date,
        follow_up_type: item.follow_up_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        status: item.status as 'pending' | 'completed' | 'overdue',
        notes: item.notes || '',
        completed_date: item.completed_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        customer: item.customer
      })) as FollowUp[];
      
      setFollowUps(typedFollowUps);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      toast({
        title: "Error",
        description: "Failed to load follow-ups. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFollowUp = async (followUpData: CreateFollowUpData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save follow-ups",
          variant: "destructive"
        });
        return false;
      }

      const followUpRecord = {
        user_id: userData.user.id,
        ...followUpData
      };

      const { error } = await supabase
        .from('follow_ups')
        .insert(followUpRecord);

      if (error) throw error;

      await fetchFollowUps();
      toast({
        title: "Success",
        description: "Follow-up saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to save follow-up. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateFollowUp = async (id: string, followUpData: Partial<FollowUp>) => {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .update(followUpData)
        .eq('id', id);

      if (error) throw error;

      await fetchFollowUps();
      toast({
        title: "Success",
        description: "Follow-up updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to update follow-up. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFollowUp = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFollowUps();
      toast({
        title: "Success",
        description: "Follow-up deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to delete follow-up. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  return {
    followUps,
    loading,
    saveFollowUp,
    updateFollowUp,
    deleteFollowUp,
    refetch: fetchFollowUps
  };
};
