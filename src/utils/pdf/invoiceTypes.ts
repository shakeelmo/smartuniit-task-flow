
export interface InvoiceData {
  number: string;
  date: string;
  dueDate: string;
  customer: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    crNumber: string;
    vatNumber: string;
  };
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  vat: number;
  total: number;
  currency: string;
  customTerms: string;
  notes: string;
}
