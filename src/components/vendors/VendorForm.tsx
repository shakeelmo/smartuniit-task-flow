
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateVendorData, UpdateVendorData } from '@/types/vendor';

interface VendorFormProps {
  data: CreateVendorData | UpdateVendorData;
  onChange: (data: CreateVendorData | UpdateVendorData) => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name *</Label>
          <Input
            id="vendor_name"
            value={data.vendor_name || ''}
            onChange={(e) => handleChange('vendor_name', e.target.value)}
            placeholder="Enter vendor name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={data.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={data.contact_person || ''}
            onChange={(e) => handleChange('contact_person', e.target.value)}
            placeholder="Enter contact person"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={data.status || 'active'} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={data.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter address"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={data.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="Enter industry"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="Enter website URL"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input
            id="tax_id"
            value={data.tax_id || ''}
            onChange={(e) => handleChange('tax_id', e.target.value)}
            placeholder="Enter tax ID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credit_limit">Credit Limit</Label>
          <Input
            id="credit_limit"
            type="number"
            value={data.credit_limit || ''}
            onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
            placeholder="Enter credit limit"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          value={data.payment_terms || ''}
          onChange={(e) => handleChange('payment_terms', e.target.value)}
          placeholder="e.g., Net 30, COD, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>
    </div>
  );
};
