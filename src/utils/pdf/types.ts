
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
    unit?: string;
    unitPrice: number;
    sectionTitle?: string; // NEW: Add section title for grouped display
  }>;
  sections?: Array<{
    id: string;
    title: string;
    lineItems: Array<{
      id?: string;
      service: string;
      description: string;
      partNumber?: string;
      quantity: number;
      unit?: string;
      unitPrice: number;
    }>;
  }>; // NEW: Add sections support
  subtotal: number;
  discount: number; // This is always the calculated amount, not percent (see dialog)
  discountType: 'percentage' | 'fixed';
  vat: number;
  total: number;
  currency: 'SAR' | 'USD';
  customTerms: string;
  notes: string;
  discountPercent?: number; // NEW: Only provided for PDF, if type is percentage (raw percentage % entered by user)
}

export interface PDFPosition {
  x: number;
  y: number;
}

export interface CurrencyInfo {
  symbol: string;
  name: string;
}
