
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface Customer {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  crNumber: string;
  vatNumber: string;
}

interface CustomerFormProps {
  customer: Customer;
  setCustomer: (customer: Customer) => void;
}

const CustomerForm = ({ customer, setCustomer }: CustomerFormProps) => {
  const updateCustomer = (field: keyof Customer, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Customer Information / معلومات العميل</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search Customer
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name / اسم الشركة *</Label>
          <Input
            id="companyName"
            value={customer.companyName}
            onChange={(e) => updateCustomer('companyName', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
        <div>
          <Label htmlFor="contactName">Contact Name / اسم جهة الاتصال</Label>
          <Input
            id="contactName"
            value={customer.contactName}
            onChange={(e) => updateCustomer('contactName', e.target.value)}
            placeholder="Enter contact name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone / الهاتف</Label>
          <Input
            id="phone"
            value={customer.phone}
            onChange={(e) => updateCustomer('phone', e.target.value)}
            placeholder="+966 5X XXX XXXX"
          />
        </div>
        <div>
          <Label htmlFor="email">Email / البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={customer.email}
            onChange={(e) => updateCustomer('email', e.target.value)}
            placeholder="email@company.com"
          />
        </div>
        <div>
          <Label htmlFor="crNumber">CR Number / رقم السجل التجاري</Label>
          <Input
            id="crNumber"
            value={customer.crNumber}
            onChange={(e) => updateCustomer('crNumber', e.target.value)}
            placeholder="1010XXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="vatNumber">VAT Number / الرقم الضريبي</Label>
          <Input
            id="vatNumber"
            value={customer.vatNumber}
            onChange={(e) => updateCustomer('vatNumber', e.target.value)}
            placeholder="3001XXXXXXXXX"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
