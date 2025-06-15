
export interface QuotationData {
  number: string;
  date: string;
  validUntil: string;
  customer: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    crNumber: string;
    vatNumber: string;
  };
  lineItems: Array<{
    id?: string;
    service: string;
    description: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  vat: number;
  total: number;
  currency: 'SAR' | 'USD';
  customTerms: string;
  notes: string;
}

export interface PDFPosition {
  x: number;
  y: number;
}

export interface CurrencyInfo {
  symbol: string;
  name: string;
}
