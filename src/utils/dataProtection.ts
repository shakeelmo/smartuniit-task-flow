
import { supabase } from '@/integrations/supabase/client';
import { QuotationData } from '@/utils/pdf/types';

export interface DataBackup {
  id: string;
  type: 'quotation' | 'proposal';
  data: any;
  timestamp: string;
  user_id: string;
  operation: 'create' | 'update' | 'delete';
  version: number;
}

export interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  context: any;
  timestamp: string;
  resolved: boolean;
}

export class DataProtectionService {
  // Enhanced error logging
  static async logError(error: Error, context: any = {}, userId?: string) {
    try {
      console.error('DataProtectionService - Error logged:', error.message, context);
      
      const errorLog = {
        error_type: error.name || 'UnknownError',
        error_message: error.message,
        stack_trace: error.stack,
        user_id: userId,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        },
        timestamp: new Date().toISOString(),
        resolved: false
      };

      // Store in database using type casting to bypass TypeScript validation
      const { error: dbError } = await (supabase as any)
        .from('error_logs')
        .insert(errorLog);

      if (dbError) {
        console.error('Failed to log error to database:', dbError);
      }

      // Also store in localStorage as backup
      const localErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      localErrors.push(errorLog);
      // Keep only last 50 errors in localStorage
      if (localErrors.length > 50) {
        localErrors.splice(0, localErrors.length - 50);
      }
      localStorage.setItem('error_logs', JSON.stringify(localErrors));

    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  // Data backup functionality
  static async createBackup(type: 'quotation' | 'proposal', data: any, operation: 'create' | 'update' | 'delete', userId: string) {
    try {
      console.log('Creating backup for:', type, operation);
      
      const backup = {
        type,
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        timestamp: new Date().toISOString(),
        user_id: userId,
        operation,
        version: Date.now() // Simple versioning
      };

      // Store in database using type casting to bypass TypeScript validation
      const { error: dbError } = await (supabase as any)
        .from('data_backups')
        .insert(backup);

      if (dbError) {
        console.error('Failed to create database backup:', dbError);
        throw dbError;
      }

      // Also store in localStorage for immediate access
      const localBackups = JSON.parse(localStorage.getItem(`${type}_backups`) || '[]');
      localBackups.push(backup);
      // Keep only last 20 backups per type
      if (localBackups.length > 20) {
        localBackups.splice(0, localBackups.length - 20);
      }
      localStorage.setItem(`${type}_backups`, JSON.stringify(localBackups));

      console.log('Backup created successfully');
      return true;
    } catch (error) {
      console.error('Backup creation failed:', error);
      await this.logError(error as Error, { type, operation, dataId: data.id || data.number });
      return false;
    }
  }

  // Retrieve backups for recovery
  static async getBackups(type: 'quotation' | 'proposal', userId: string, limit: number = 10) {
    try {
      const { data, error } = await (supabase as any)
        .from('data_backups')
        .select('*')
        .eq('type', type)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to retrieve backups:', error);
      
      // Fallback to localStorage
      const localBackups = JSON.parse(localStorage.getItem(`${type}_backups`) || '[]');
      return localBackups.slice(0, limit);
    }
  }

  // Auto-save functionality
  static async autoSave(type: 'quotation' | 'proposal', data: any, userId: string) {
    try {
      const autoSaveKey = `${type}_autosave_${data.id || data.number || 'draft'}`;
      const autoSaveData = {
        data,
        timestamp: new Date().toISOString(),
        user_id: userId
      };

      localStorage.setItem(autoSaveKey, JSON.stringify(autoSaveData));
      console.log('Auto-save completed for:', autoSaveKey);
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }

  // Retrieve auto-saved data
  static getAutoSavedData(type: 'quotation' | 'proposal', id: string) {
    try {
      const autoSaveKey = `${type}_autosave_${id}`;
      const saved = localStorage.getItem(autoSaveKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to retrieve auto-saved data:', error);
      return null;
    }
  }

  // Clear auto-saved data after successful save
  static clearAutoSave(type: 'quotation' | 'proposal', id: string) {
    try {
      const autoSaveKey = `${type}_autosave_${id}`;
      localStorage.removeItem(autoSaveKey);
      console.log('Auto-save cleared for:', autoSaveKey);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }

  // Data recovery utilities
  static async recoverData(backupId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('data_backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Data recovery failed:', error);
      await this.logError(error as Error, { backupId });
      return null;
    }
  }

  // Validate data integrity
  static validateQuotationData(data: QuotationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.number || data.number.trim() === '') {
      errors.push('Quotation number is required');
    }

    if (!data.customer || !data.customer.companyName || data.customer.companyName.trim() === '') {
      errors.push('Customer company name is required');
    }

    if (!data.lineItems || data.lineItems.length === 0) {
      errors.push('At least one line item is required');
    } else {
      data.lineItems.forEach((item, index) => {
        if (!item.service || item.service.trim() === '') {
          errors.push(`Line item ${index + 1}: Service description is required`);
        }
        if (isNaN(item.quantity) || item.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Valid quantity is required`);
        }
        if (isNaN(item.unitPrice) || item.unitPrice < 0) {
          errors.push(`Line item ${index + 1}: Valid unit price is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
