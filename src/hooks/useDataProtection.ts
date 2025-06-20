
import { useState, useEffect, useCallback } from 'react';
import { DataProtectionService } from '@/utils/dataProtection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useDataProtection = (type: 'quotation' | 'proposal') => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(async () => {
      if (hasUnsavedChanges) {
        await performAutoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges]);

  const performAutoSave = useCallback(async (data?: any) => {
    if (!data) return;

    try {
      setIsAutoSaving(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const success = await DataProtectionService.autoSave(type, data, userData.user.id);
      
      if (success) {
        setLastAutoSave(new Date());
        setHasUnsavedChanges(false);
        console.log('Auto-save completed');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      await DataProtectionService.logError(error as Error, { type, operation: 'auto-save' });
    } finally {
      setIsAutoSaving(false);
    }
  }, [type]);

  const createBackup = useCallback(async (data: any, operation: 'create' | 'update' | 'delete') => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      return await DataProtectionService.createBackup(type, data, operation, userData.user.id);
    } catch (error) {
      console.error('Backup creation error:', error);
      await DataProtectionService.logError(error as Error, { type, operation });
      return false;
    }
  }, [type]);

  const logError = useCallback(async (error: Error, context?: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      await DataProtectionService.logError(error, context, userData.user?.id);
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  }, []);

  const getBackups = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      return await DataProtectionService.getBackups(type, userData.user.id);
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }, [type]);

  const recoverFromBackup = useCallback(async (backupId: string) => {
    try {
      const recoveredData = await DataProtectionService.recoverData(backupId);
      if (recoveredData) {
        toast({
          title: "Data Recovered",
          description: `Successfully recovered ${type} from backup`,
        });
        return recoveredData.data;
      } else {
        toast({
          title: "Recovery Failed",
          description: "Could not recover data from the selected backup",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: "Recovery Error",
        description: "An error occurred while recovering data",
        variant: "destructive"
      });
    }
    return null;
  }, [type, toast]);

  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const clearUnsavedChanges = useCallback((id?: string) => {
    setHasUnsavedChanges(false);
    if (id) {
      DataProtectionService.clearAutoSave(type, id);
    }
  }, [type]);

  return {
    isAutoSaving,
    lastAutoSave,
    hasUnsavedChanges,
    performAutoSave,
    createBackup,
    logError,
    getBackups,
    recoverFromBackup,
    markUnsavedChanges,
    clearUnsavedChanges
  };
};
