
export interface Customer {
  id: string;
  user_id: string;
  customer_name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  project_interest?: string;
  status: 'active' | 'inactive' | 'prospect' | 'client';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  customer_id: string;
  follow_up_date: string;
  follow_up_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CreateCustomerData {
  customer_name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  project_interest?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'client';
  notes?: string;
}

export interface CreateFollowUpData {
  customer_id: string;
  follow_up_date: string;
  follow_up_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}
