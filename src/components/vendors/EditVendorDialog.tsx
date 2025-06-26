
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VendorForm } from './VendorForm';
import { useVendors } from '@/hooks/useVendors';
import { Vendor, UpdateVendorData } from '@/types/vendor';

interface EditVendorDialogProps {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditVendorDialog: React.FC<EditVendorDialogProps> = ({
  vendor,
  open,
  onOpenChange,
}) => {
  const { updateVendor } = useVendors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateVendorData>({
    vendor_name: vendor.vendor_name,
    company_name: vendor.company_name,
    contact_person: vendor.contact_person,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    industry: vendor.industry,
    website: vendor.website,
    tax_id: vendor.tax_id,
    payment_terms: vendor.payment_terms,
    credit_limit: vendor.credit_limit,
    status: vendor.status,
    notes: vendor.notes,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_name?.trim()) return;

    setLoading(true);
    const success = await updateVendor(vendor.id, formData);
    if (success) {
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <VendorForm data={formData} onChange={setFormData} />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.vendor_name?.trim()}>
              {loading ? 'Updating...' : 'Update Vendor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
