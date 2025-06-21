import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, FileText, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateProposalPDF } from '@/utils/proposalPdfExport';
import { CommercialItemsTable } from './CommercialItemsTable';
import { QuotationSummary } from './QuotationSummary';
import { PaymentTermsForm } from './PaymentTermsForm';
import { BankDetailsForm } from './BankDetailsForm';
import { TableOfContents } from './TableOfContents';
import { DocumentVersionTracker } from './DocumentVersionTracker';
import { VisualReferencesSection } from './VisualReferencesSection';
import { InlineCalculator } from './InlineCalculator';
import { CustomerAcceptanceSection } from './CustomerAcceptanceSection';

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

interface VisualReference {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface CalculationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

interface CustomerAcceptanceData {
  customerSignature: string;
  customerName: string;
  customerTitle: string;
  customerDate: string;
  companySignature: string;
  companyRepresentative: string;
  companyTitle: string;
  companyDate: string;
  acceptanceNotes: string;
}

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
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
  const [activeSection, setActiveSection] = useState('toc');
  
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
    } as BankDetails,
    visual_references: [] as VisualReference[],
    calculation_items: [] as CalculationItem[],
    customer_acceptance: {
      customerSignature: '',
      customerName: '',
      customerTitle: '',
      customerDate: '',
      companySignature: '',
      companyRepresentative: '',
      companyTitle: '',
      companyDate: '',
      acceptanceNotes: ''
    } as CustomerAcceptanceData,
    document_version: '1.0',
    version_history: [
      {
        version: '1.0',
        date: new Date().toISOString(),
        author: 'System',
        changes: 'Initial proposal creation'
      }
    ] as VersionEntry[]
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
        },
        visual_references: proposal.visual_references || [],
        calculation_items: proposal.calculation_items || [],
        customer_acceptance: proposal.customer_acceptance || {
          customerSignature: '',
          customerName: '',
          customerTitle: '',
          customerDate: '',
          companySignature: '',
          companyRepresentative: '',
          companyTitle: '',
          companyDate: '',
          acceptanceNotes: ''
        },
        document_version: proposal.document_version || '1.0',
        version_history: proposal.version_history || []
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

  const updateCustomerAcceptance = (field: keyof CustomerAcceptanceData, value: string) => {
    setFormData(prev => ({
      ...prev,
      customer_acceptance: {
        ...prev.customer_acceptance,
        [field]: value
      }
    }));
  };

  const handleVersionUpdate = (newVersion: string, changes: string) => {
    const newEntry: VersionEntry = {
      version: newVersion,
      date: new Date().toISOString(),
      author: 'Current User', // This could be from auth context
      changes
    };
    
    setFormData(prev => ({
      ...prev,
      document_version: newVersion,
      version_history: [newEntry, ...prev.version_history]
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);

  const sections = [
    { id: 'toc', title: 'Table of Contents' },
    { id: 'version', title: 'Document Version' },
    { id: 'quotation', title: 'Commercial Quotation' },
    { id: 'calculator', title: 'Cost Calculator' },
    { id: 'terms', title: 'Payment Terms' },
    { id: 'banking', title: 'Banking Information' },
    { id: 'visual', title: 'Visual References' },
    { id: 'acceptance', title: 'Customer Acceptance' }
  ];

  const createQuotationData = () => {
    const subtotal = grandTotal;
    const vatRate = 0.15;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    const formattedLineItems = items.map((item, index) => ({
      serialNumber: index + 1,
      service: item.description || `Commercial Item ${index + 1}`,
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
      lineItems: formattedLineItems,
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
      
      const proposalDataForPDF = {
        ...proposal,
        quotation_data: quotationData,
        commercial_items: items,
        document_version: formData.document_version,
        visual_references: formData.visual_references,
        customer_acceptance: formData.customer_acceptance
      };

      await generateProposalPDF(proposalDataForPDF);
      
      toast({
        title: "PDF Generated",
        description: "Enhanced commercial proposal PDF has been generated successfully",
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
      const quotationData = items.length > 0 ? createQuotationData() : null;
      
      const proposalData = {
        payment_terms: formData.payment_terms,
        project_duration_days: formData.project_duration_days ? parseInt(formData.project_duration_days) : null,
        bank_details: formData.bank_details as any,
        quotation_data: quotationData,
        visual_references: formData.visual_references,
        calculation_items: formData.calculation_items,
        customer_acceptance: formData.customer_acceptance,
        document_version: formData.document_version,
        version_history: formData.version_history
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
      await supabase
        .from('proposal_commercial_items')
        .delete()
        .eq('proposal_id', proposalId);

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
        description: "Enhanced commercial proposal saved successfully",
      });

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'toc':
        return (
          <TableOfContents
            sections={sections}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
        );
      case 'version':
        return (
          <DocumentVersionTracker
            currentVersion={formData.document_version}
            lastUpdated={proposal?.updated_at || new Date().toISOString()}
            versionHistory={formData.version_history}
            onVersionUpdate={handleVersionUpdate}
          />
        );
      case 'quotation':
        return (
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
        );
      case 'calculator':
        return (
          <InlineCalculator
            calculationItems={formData.calculation_items}
            onCalculationChange={(items) => setFormData(prev => ({ ...prev, calculation_items: items }))}
          />
        );
      case 'terms':
        return (
          <PaymentTermsForm
            projectDurationDays={formData.project_duration_days}
            paymentTerms={formData.payment_terms}
            onProjectDurationChange={(value) => setFormData(prev => ({ ...prev, project_duration_days: value }))}
            onPaymentTermsChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
          />
        );
      case 'banking':
        return (
          <BankDetailsForm
            bankDetails={formData.bank_details}
            onBankDetailsChange={updateBankDetails}
          />
        );
      case 'visual':
        return (
          <VisualReferencesSection
            references={formData.visual_references}
            onReferencesChange={(refs) => setFormData(prev => ({ ...prev, visual_references: refs }))}
          />
        );
      case 'acceptance':
        return (
          <CustomerAcceptanceSection
            acceptanceData={formData.customer_acceptance}
            onAcceptanceChange={updateCustomerAcceptance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with TOC */}
      <div className="w-80 flex-shrink-0 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" />
            Navigation
          </h2>
          <TableOfContents
            sections={sections}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Enhanced Commercial Proposal
              </h2>
              <p className="text-gray-600">Professional quotation with advanced features</p>
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

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderActiveSection()}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Save Button */}
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
              {loading ? 'Saving...' : 'Save Enhanced Proposal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
