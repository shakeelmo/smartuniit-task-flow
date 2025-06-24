
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuotationData } from '@/utils/pdf/types';
import { DataProtectionService } from '@/utils/dataProtection';
import { useDataProtection } from '@/hooks/useDataProtection';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { createBackup, logError } = useDataProtection('quotation');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotations: QuotationData[] = data.map(q => ({
        number: q.number,
        date: q.date,
        validUntil: q.valid_until || '',
        customer: typeof q.customer_data === 'object' && q.customer_data !== null ? q.customer_data as any : {
          companyName: '',
          contactName: '',
          phone: '',
          email: '',
          crNumber: '',
          vatNumber: ''
        },
        lineItems: Array.isArray(q.line_items) ? q.line_items as any[] : [],
        sections: Array.isArray(q.sections) ? q.sections as any[] : [],
        subtotal: parseFloat(q.subtotal.toString()),
        discount: parseFloat(q.discount.toString()),
        discountType: (q.discount_type === 'fixed' || q.discount_type === 'percentage') ? q.discount_type : 'percentage',
        discountPercent: q.discount_percent ? parseFloat(q.discount_percent.toString()) : undefined,
        vat: parseFloat(q.vat.toString()),
        total: parseFloat(q.total.toString()),
        currency: (q.currency === 'SAR' || q.currency === 'USD') ? q.currency : 'SAR',
        customTerms: q.custom_terms || '',
        notes: q.notes || ''
      }));

      setQuotations(formattedQuotations);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      await logError(error as Error, { operation: 'fetch_quotations' });
      toast({
        title: "Error",
        description: "Failed to load quotations. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuotation = async (quotationData: QuotationData) => {
    try {
      // Validate data before saving
      const validation = DataProtectionService.validateQuotationData(quotationData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: `Please fix the following issues: ${validation.errors.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save quotations",
          variant: "destructive"
        });
        throw new Error('Not authenticated');
      }

      // Create backup before saving
      await createBackup(quotationData, 'create');

      const quotationRecord = {
        user_id: userData.user.id,
        number: quotationData.number,
        date: quotationData.date,
        valid_until: quotationData.validUntil,
        customer_data: quotationData.customer,
        line_items: quotationData.lineItems,
        sections: quotationData.sections || [],
        subtotal: quotationData.subtotal,
        discount: quotationData.discount,
        discount_type: quotationData.discountType,
        discount_percent: quotationData.discountPercent,
        vat: quotationData.vat,
        total: quotationData.total,
        currency: quotationData.currency,
        custom_terms: quotationData.customTerms,
        notes: quotationData.notes,
        status: 'draft'
      };

      console.log('Attempting to save/update quotation:', quotationRecord);

      // First check if quotation with this number already exists
      const { data: existingQuotation, error: checkError } = await supabase
        .from('quotations')
        .select('id, user_id')
        .eq('number', quotationData.number)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing quotation:', checkError);
        await logError(checkError, { operation: 'check_existing', quotationNumber: quotationData.number });
        throw checkError;
      }

      let result;
      if (existingQuotation) {
        // Update existing quotation - create backup first
        await createBackup(quotationData, 'update');
        
        console.log('Updating existing quotation');
        const { data, error } = await supabase
          .from('quotations')
          .update(quotationRecord)
          .eq('number', quotationData.number)
          .eq('user_id', userData.user.id)
          .select();
        
        if (error) {
          await logError(error, { operation: 'update_quotation', quotationNumber: quotationData.number });
          throw error;
        }
        result = data;
      } else {
        // Insert new quotation
        console.log('Inserting new quotation');
        const { data, error } = await supabase
          .from('quotations')
          .insert(quotationRecord)
          .select();
        
        if (error) {
          await logError(error, { operation: 'insert_quotation', quotationNumber: quotationData.number });
          throw error;
        }
        result = data;
      }

      console.log('Quotation save result:', result);
      await fetchQuotations();
      
      // Clear auto-save after successful save
      DataProtectionService.clearAutoSave('quotation', quotationData.number);
      
      toast({
        title: "Success",
        description: "Quotation saved successfully with backup created",
      });

      return true;
    } catch (error) {
      console.error('Error saving quotation:', error);
      await logError(error as Error, { operation: 'save_quotation', quotationData });
      toast({
        title: "Error",
        description: "Failed to save quotation. A backup has been created locally. Please try again or contact support.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateQuotation = async (quotationData: QuotationData) => {
    try {
      // Validate data before updating
      const validation = DataProtectionService.validateQuotationData(quotationData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: `Please fix the following issues: ${validation.errors.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update quotations",
          variant: "destructive"
        });
        throw new Error('Not authenticated');
      }

      // Create backup before updating
      await createBackup(quotationData, 'update');

      const quotationRecord = {
        date: quotationData.date,
        valid_until: quotationData.validUntil,
        customer_data: quotationData.customer,
        line_items: quotationData.lineItems,
        sections: quotationData.sections || [],
        subtotal: quotationData.subtotal,
        discount: quotationData.discount,
        discount_type: quotationData.discountType,
        discount_percent: quotationData.discountPercent,
        vat: quotationData.vat,
        total: quotationData.total,
        currency: quotationData.currency,
        custom_terms: quotationData.customTerms,
        notes: quotationData.notes
      };

      const { error } = await supabase
        .from('quotations')
        .update(quotationRecord)
        .eq('number', quotationData.number)
        .eq('user_id', userData.user.id);

      if (error) {
        await logError(error, { operation: 'update_quotation', quotationNumber: quotationData.number });
        throw error;
      }

      await fetchQuotations();
      
      // Clear auto-save after successful update
      DataProtectionService.clearAutoSave('quotation', quotationData.number);
      
      toast({
        title: "Success",
        description: "Quotation updated successfully with backup created",
      });

      return true;
    } catch (error) {
      console.error('Error updating quotation:', error);
      await logError(error as Error, { operation: 'update_quotation', quotationData });
      toast({
        title: "Error",
        description: "Failed to update quotation. A backup has been created locally. Please try again or contact support.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations,
    loading,
    saveQuotation,
    updateQuotation,
    refetch: fetchQuotations
  };
};
