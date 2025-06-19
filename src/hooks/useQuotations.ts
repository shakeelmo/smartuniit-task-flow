
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuotationData } from '@/utils/pdf/types';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuotation = async (quotationData: QuotationData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

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
        throw checkError;
      }

      let result;
      if (existingQuotation) {
        // Update existing quotation
        console.log('Updating existing quotation');
        const { data, error } = await supabase
          .from('quotations')
          .update(quotationRecord)
          .eq('number', quotationData.number)
          .eq('user_id', userData.user.id)
          .select();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new quotation
        console.log('Inserting new quotation');
        const { data, error } = await supabase
          .from('quotations')
          .insert(quotationRecord)
          .select();
        
        if (error) throw error;
        result = data;
      }

      console.log('Quotation save result:', result);
      await fetchQuotations();
      
      toast({
        title: "Success",
        description: "Quotation saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Error",
        description: "Failed to save quotation",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateQuotation = async (quotationData: QuotationData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

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

      if (error) throw error;

      await fetchQuotations();
      
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation",
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
