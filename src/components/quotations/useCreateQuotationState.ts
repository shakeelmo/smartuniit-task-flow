
import { useState } from 'react';

export interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

export interface Section {
  id: string;
  title: string;
  lineItems: LineItem[];
}

export interface Customer {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  crNumber: string;
  vatNumber: string;
}

const VAT_RATE = 0.15;

export const useCreateQuotationState = () => {
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

  // Changed from lineItems to sections
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'General Services / الخدمات العامة',
      lineItems: [{ 
        id: '1', 
        service: '', 
        description: '', 
        partNumber: '', 
        quantity: 1, 
        unit: '', 
        unitPrice: 0 
      }]
    }
  ]);

  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [currency, setCurrency] = useState<'SAR' | 'USD'>('SAR');
  const [customTerms, setCustomTerms] = useState(`• Payment: 100%
• All prices in Saudi Riyals
• Delivery– 1 Week after PO
• Offers will be confirmed based on your purchase order.
• Product availability and prices are subject to change without notice`);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [isExporting, setIsExporting] = useState(false);

  // Helper function to get all line items from all sections
  const getAllLineItems = (): LineItem[] => {
    return sections.flatMap(section => section.lineItems);
  };

  const calculateSubtotal = () => {
    return getAllLineItems().reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
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

  const getCurrencyName = () => {
    return currency === 'SAR' ? 'Saudi Riyals' : 'US Dollars';
  };

  // Legacy functions for backward compatibility
  const addLineItem = () => {
    // Add to the first section for backward compatibility
    if (sections.length > 0) {
      const newLineItem: LineItem = {
        id: Date.now().toString(),
        service: '',
        description: '',
        partNumber: '',
        quantity: 1,
        unit: '',
        unitPrice: 0
      };
      
      const updatedSections = sections.map((section, index) => 
        index === 0 
          ? { ...section, lineItems: [...section.lineItems, newLineItem] }
          : section
      );
      setSections(updatedSections);
    }
  };

  const removeLineItem = (id: string) => {
    const updatedSections = sections.map(section => ({
      ...section,
      lineItems: section.lineItems.length > 1 
        ? section.lineItems.filter(item => item.id !== id)
        : section.lineItems
    }));
    setSections(updatedSections);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedSections = sections.map(section => ({
      ...section,
      lineItems: section.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
    setSections(updatedSections);
  };

  const generateQuoteNumber = () => {
    return `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  };

  return {
    customer, setCustomer,
    customerType, setCustomerType,
    sections, setSections,
    notes, setNotes,
    validUntil, setValidUntil,
    currency, setCurrency,
    customTerms, setCustomTerms,
    discount, setDiscount,
    discountType, setDiscountType,
    isExporting, setIsExporting,
    showUnitColumn, setShowUnitColumn,
    calculateSubtotal,
    calculateDiscountAmount,
    calculateAfterDiscount,
    calculateVAT,
    calculateTotal,
    getCurrencySymbol,
    getCurrencyName,
    addLineItem,
    removeLineItem,
    updateLineItem,
    generateQuoteNumber,
    getAllLineItems
  };
};
