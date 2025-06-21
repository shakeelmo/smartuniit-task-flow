
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateProposalPDF } from '@/utils/proposalPdfExport';
import { CommercialItemsTable } from './CommercialItemsTable';
import { QuotationSummary } from './QuotationSummary';
import { PaymentTermsForm } from './PaymentTermsForm';
import { BankDetailsForm } from './BankDetailsForm';

interface CommercialItem {
  id: string;
  serial_number: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  branch: string;
}

interface ProposalCommercialFormProps {
  proposalId: string;
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const ProposalCommercialForm: React.FC<ProposalCommercialFormProps> = ({
  proposalId,
  proposal,
  onUpdate,
  loading: externalLoading
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CommercialItem[]>([]);
  const [formData, setFormData] = useState({
    payment_terms: '',
    project_duration_days: '',
    bank_details: {
      bank_name: '',
      account_name: '',
      account_number: '',
      iban: '',
      swift_code: '',
      branch: ''
    } as BankDetails
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        payment_terms: proposal.payment_terms || '',
        project_duration_days: proposal.project_duration_days?.toString() || '',
        bank_details: proposal.bank_details || {
          bank_name: '',
          account_name: '',
          account_number: '',
          iban: '',
          swift_code: '',
          branch: ''
        }
      });
    }
    loadCommercialItems();
  }, [proposal, proposalId]);

  const loadCommercialItems = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_commercial_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading commercial items:', error);
    }
  };

  const updateBankDetails = (field: keyof BankDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [field]: value
      }
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);

  // Enhanced quotation data format to ensure proper PDF generation with serial numbers
  const createQuotationData = () => {
    const subtotal = grandTotal;
    const vatRate = 0.15; // 15% VAT
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // Create properly formatted line items with serial numbers for PDF generation
    const formattedLineItems = items.map((item, index) => ({
      serialNumber: index + 1, // Explicit serial number
      service: item.description || `Commercial Item ${index + 1}`, // Use description as service
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      total: Number(item.total_price) || 0,
      unit: item.unit || 'Each'
    }));

    console.log('Creating quotation data with formatted line items:', formattedLineItems);

    return {
      number: `QUO-${proposalId.slice(-8)}`,
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'SAR',
      lineItems: formattedLineItems, // Use the properly formatted items
      subtotal,
      discount: 0,
      discountAmount: 0,
      vat: vatAmount,
      total,
      customTerms: formData.payment_terms,
      notes: `Project Duration: ${formData.project_duration_days} days`,
      customer: {
        companyName: proposal?.client_company_name || 'Commercial Proposal Customer',
        contactPerson: proposal?.client_contact_person || '',
        email: proposal?.client_email || '',
        phone: proposal?.client_phone || '',
        address: ''
      }
    };
  };

  const handleExportPDF = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one commercial item before exporting PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const quotationData = createQuotationData();
      
      // Create proposal data for PDF export
      const proposalDataForPDF = {
        ...proposal,
        quotation_data: quotationData,
        commercial_items: items
      };

      await generateProposalPDF(proposalDataForPDF);
      
      toast({
        title: "PDF Generated",
        description: "Commercial proposal PDF has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create quotation data for the proposal
      const quotationData = items.length > 0 ? createQuotationData() : null;
      
      // Save proposal data including quotation_data
      const proposalData = {
        payment_terms: formData.payment_terms,
        project_duration_days: formData.project_duration_days ? parseInt(formData.project_duration_days) : null,
        bank_details: formData.bank_details as any,
        quotation_data: quotationData // This is crucial for PDF generation
      };

      if (onUpdate) {
        await onUpdate(proposalData);
      } else {
        const { error: proposalError } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', proposalId);

        if (proposalError) throw proposalError;
      }

      // Save commercial items
      // Delete existing items
      await supabase
        .from('proposal_commercial_items')
        .delete()
        .eq('proposal_id', proposalId);

      // Insert new items
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          proposal_id: proposalId,
          serial_number: index + 1,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          unit_price: Number(item.unit_price),
          sort_order: index
        }));

        const { error: itemsError } = await supabase
          .from('proposal_commercial_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Commercial proposal saved successfully",
      });

      // Reload items to get proper IDs
      loadCommercialItems();
    } catch (error) {
      console.error('Error saving commercial proposal:', error);
      toast({
        title: "Error",
        description: "Failed to save commercial proposal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Commercial Proposal & Quotation
            </h2>
            <p className="text-gray-600">Detailed pricing, terms, and commercial information</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPDF}
              disabled={loading || items.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Commercial Items/Quotation Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Commercial Quotation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommercialItemsTable 
                  items={items}
                  onItemsChange={setItems}
                />
                
                {items.length > 0 && (
                  <QuotationSummary grandTotal={grandTotal} />
                )}
              </CardContent>
            </Card>

            {/* Payment Terms & Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PaymentTermsForm
                projectDurationDays={formData.project_duration_days}
                paymentTerms={formData.payment_terms}
                onProjectDurationChange={(value) => setFormData(prev => ({ ...prev, project_duration_days: value }))}
                onPaymentTermsChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
              />

              <BankDetailsForm
                bankDetails={formData.bank_details}
                onBankDetailsChange={updateBankDetails}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Save Button - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {items.length > 0 && (
              <span>Total: SAR {(grandTotal * 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({items.length} items)</span>
            )}
          </div>
          <Button 
            onClick={handleSave}
            disabled={loading || externalLoading}
            className="min-w-[200px]"
          >
            {loading ? 'Saving...' : 'Save Commercial Proposal'}
          </Button>
        </div>
      </div>
    </div>
  );
};
