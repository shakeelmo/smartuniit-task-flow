import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import InvoiceCustomerForm from './InvoiceCustomerForm';
import InvoiceLineItemsTable from './InvoiceLineItemsTable';
import { InvoiceData } from '@/utils/pdf/invoiceTypes';
import { generateInvoicePDF } from '@/utils/invoicePdfExport';

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onSave: (invoice: InvoiceData) => void;
}

const EditInvoiceDialog = ({ isOpen, onClose, invoice, onSave }: EditInvoiceDialogProps) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: {
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      crNumber: '',
      vatNumber: ''
    },
    lineItems: [],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    vat: 0,
    total: 0,
    currency: 'SAR',
    customTerms: '',
    notes: ''
  });

  useEffect(() => {
    if (invoice) {
      setInvoiceData({
        ...invoice,
        date: invoice.date.split('T')[0],
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, [invoice]);

  const handleSave = () => {
    onSave(invoiceData);
  };

  const handleExportPDF = async () => {
    try {
      await generateInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error exporting invoice PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice / تعديل الفاتورة</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number / رقم الفاتورة</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.number}
                onChange={(e) => setInvoiceData({ ...invoiceData, number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date / تاريخ الفاتورة</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date / تاريخ الاستحقاق</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Customer Information */}
          <InvoiceCustomerForm
            customer={invoiceData.customer}
            setCustomer={(customer) => setInvoiceData({ ...invoiceData, customer })}
          />

          {/* Line Items */}
          <InvoiceLineItemsTable
            lineItems={invoiceData.lineItems}
            setLineItems={(lineItems) => setInvoiceData({ ...invoiceData, lineItems })}
            subtotal={invoiceData.subtotal}
            setSubtotal={(subtotal) => setInvoiceData({ ...invoiceData, subtotal })}
            discount={invoiceData.discount}
            setDiscount={(discount) => setInvoiceData({ ...invoiceData, discount })}
            discountType={invoiceData.discountType}
            setDiscountType={(discountType) => setInvoiceData({ ...invoiceData, discountType })}
            vat={invoiceData.vat}
            setVat={(vat) => setInvoiceData({ ...invoiceData, vat })}
            total={invoiceData.total}
            setTotal={(total) => setInvoiceData({ ...invoiceData, total })}
          />

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customTerms">Payment Terms / شروط الدفع</Label>
              <Textarea
                id="customTerms"
                value={invoiceData.customTerms}
                onChange={(e) => setInvoiceData({ ...invoiceData, customTerms: e.target.value })}
                placeholder="Enter payment terms..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes / ملاحظات</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                placeholder="Enter additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="bg-blue-50 hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF / تصدير PDF
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel / إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-smart-orange hover:bg-smart-orange-light">
                Save Changes / حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceDialog;
