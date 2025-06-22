
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FollowUp } from '@/types/customer';

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      setFollowUps(data || []);
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

  const saveFollowUp = async (followUpData: Omit<FollowUp, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customer'>) => {
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
