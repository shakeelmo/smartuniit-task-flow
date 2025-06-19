
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateQuotationPDF, QuotationData } from '@/utils/pdfExport';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

interface Customer {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  crNumber: string;
  vatNumber: string;
}

const VAT_RATE = 0.15;

export const useEditQuotationState = (quotationData?: QuotationData | null, open?: boolean) => {
  const [customer, setCustomer] = useState<Customer>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    crNumber: '',
    vatNumber: ''
  });

  const [customerType, setCustomerType] = useState<'existing' | 'new'>('new');
  const [showUnitColumn, setShowUnitColumn] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', service: '', description: '', partNumber: '', quantity: 1, unitPrice: 0 }
  ]);

  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [currency, setCurrency] = useState<'SAR' | 'USD'>('SAR');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [customTerms, setCustomTerms] = useState(`• Payment: 100%
• All prices in Saudi Riyals
• Delivery– 1 Week after PO
• Offers will be confirmed based on your purchase order.
• Product availability and prices are subject to change without notice`);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load existing quotation data when dialog opens
  useEffect(() => {
    if (quotationData && open) {
      setCustomer(quotationData.customer);
      setLineItems(quotationData.lineItems.map(item => ({
        id: item.id || Date.now().toString(),
        service: item.service,
        description: item.description,
        partNumber: item.partNumber || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })));
      setNotes(quotationData.notes);
      setValidUntil(quotationData.validUntil.split('T')[0]); // Convert to date format
      setCurrency(quotationData.currency);
      setDiscount(quotationData.discount || 0);
      setDiscountType(quotationData.discountType || 'percentage');
      setCustomTerms(quotationData.customTerms);
    }
  }, [quotationData, open]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discount / 100);
    }
    return discount;
  };

  const calculateAfterDiscount = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const calculateVAT = () => {
    return calculateAfterDiscount() * VAT_RATE;
  };

  const calculateTotal = () => {
    return calculateAfterDiscount() + calculateVAT();
  };

  const getCurrencySymbol = () => {
    return currency === 'SAR' ? '﷼' : '$';
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      service: '',
      description: '',
      partNumber: '',
      quantity: 1,
      unitPrice: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleExportPDF = async () => {
    if (!customer.companyName.trim()) {
      toast({ title: "Missing Info", description: "Please enter a company name before exporting PDF", variant: "destructive" });
      return;
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.service.trim())) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting PDF", variant: "destructive" });
      return;
    }

    setIsExporting(true);

    const quotationDataForPDF: QuotationData = {
      number: quotationData?.number || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: quotationData?.date || new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes
    };

    try {
      const success = await generateQuotationPDF(quotationDataForPDF);
      if (success) {
        toast({ title: "PDF Exported", description: "PDF exported successfully!", variant: "default" });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: "Failed to export PDF", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    customer, setCustomer,
    customerType, setCustomerType,
    showUnitColumn, setShowUnitColumn,
    lineItems, setLineItems,
    notes, setNotes,
    validUntil, setValidUntil,
    currency, setCurrency,
    discount, setDiscount,
    discountType, setDiscountType,
    customTerms, setCustomTerms,
    isExporting,
    calculateSubtotal,
    calculateDiscountAmount,
    calculateAfterDiscount,
    calculateVAT,
    calculateTotal,
    getCurrencySymbol,
    addLineItem,
    removeLineItem,
    updateLineItem,
    handleExportPDF
  };
};
