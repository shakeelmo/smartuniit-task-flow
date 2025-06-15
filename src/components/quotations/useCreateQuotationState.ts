
import { useState } from 'react';

export interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
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

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', service: '', description: '', partNumber: '', quantity: 1, unitPrice: 0 }
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

  const getCurrencyName = () => {
    return currency === 'SAR' ? 'Saudi Riyals' : 'US Dollars';
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

  const generateQuoteNumber = () => {
    return `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  };

  return {
    customer, setCustomer,
    lineItems, setLineItems,
    notes, setNotes,
    validUntil, setValidUntil,
    currency, setCurrency,
    customTerms, setCustomTerms,
    discount, setDiscount,
    discountType, setDiscountType,
    isExporting, setIsExporting,
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
    generateQuoteNumber
  };
};
