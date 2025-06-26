
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VendorForm } from './VendorForm';
import { useVendors } from '@/hooks/useVendors';
import { CreateVendorData } from '@/types/vendor';

interface CreateVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateVendorDialog: React.FC<CreateVendorDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createVendor } = useVendors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVendorData>({
    vendor_name: '',
    status: 'active',
  });

  const handleFormDataChange = (data: CreateVendorData | Partial<CreateVendorData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_name.trim()) return;

    setLoading(true);
    const success = await createVendor(formData);
    if (success) {
      setFormData({ vendor_name: '', status: 'active' });
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <VendorForm data={formData} onChange={handleFormDataChange} />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.vendor_name.trim()}>
              {loading ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
