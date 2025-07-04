
export interface Vendor {
  id: string;
  vendor_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  industry?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateVendorData {
  vendor_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  industry?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
}

export type UpdateVendorData = Partial<CreateVendorData>;
