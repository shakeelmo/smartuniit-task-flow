
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, FileText } from 'lucide-react';
import EditQuotationForm from './EditQuotationForm';
import { QuotationData } from '@/utils/pdfExport';

interface EditQuotationDialogContentProps {
  isEditMode: boolean;
  customer: any;
  setCustomer: any;
  customerType: 'existing' | 'new';
  setCustomerType: (type: 'existing' | 'new') => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
  lineItems: any[];
  updateLineItem: (id: string, field: any, value: any) => void;
  removeLineItem: (id: string) => void;
  addLineItem: () => void;
  currency: 'SAR' | 'USD';
  setCurrency: (currency: 'SAR' | 'USD') => void;
  validUntil: string;
  setValidUntil: (date: string) => void;
  quotationData?: QuotationData | null;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  discount: number;
  setDiscount: (discount: number) => void;
  calculateSubtotal: () => number;
  calculateDiscountAmount: () => number;
  calculateAfterDiscount: () => number;
  calculateVAT: () => number;
  calculateTotal: () => number;
  getCurrencySymbol: () => string;
  customTerms: string;
  setCustomTerms: (terms: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onSave: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditQuotationDialogContent = ({
  isEditMode,
  customer, setCustomer,
  customerType, setCustomerType,
  showUnitColumn, setShowUnitColumn,
  lineItems, updateLineItem, removeLineItem, addLineItem,
  currency, setCurrency,
  validUntil, setValidUntil,
  quotationData,
  discountType, setDiscountType,
  discount, setDiscount,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateAfterDiscount,
  calculateVAT,
  calculateTotal,
  getCurrencySymbol,
  customTerms, setCustomTerms,
  notes, setNotes,
  onSave,
  onExportPDF,
  isExporting,
  onOpenChange
}: EditQuotationDialogContentProps) => {
  const quotationNumber = quotationData?.number || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          {isEditMode ? 'Edit Quotation' : 'Create New Quotation'} / {isEditMode ? 'تعديل عرض السعر' : 'إنشاء عرض سعر جديد'}
        </DialogTitle>
      </DialogHeader>

      <EditQuotationForm
        customer={customer}
        setCustomer={setCustomer}
        customerType={customerType}
        setCustomerType={setCustomerType}
        showUnitColumn={showUnitColumn}
        setShowUnitColumn={setShowUnitColumn}
        lineItems={lineItems}
        updateLineItem={updateLineItem}
        removeLineItem={removeLineItem}
        addLineItem={addLineItem}
        currency={currency}
        setCurrency={setCurrency}
        validUntil={validUntil}
        setValidUntil={setValidUntil}
        quotationNumber={quotationNumber}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discount={discount}
        setDiscount={setDiscount}
        calculateDiscountAmount={calculateDiscountAmount}
        getCurrencySymbol={getCurrencySymbol}
        customTerms={customTerms}
        setCustomTerms={setCustomTerms}
        notes={notes}
        setNotes={setNotes}
      />

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal / المجموع الفرعي:</span>
            <span className="font-medium">{getCurrencySymbol()} {calculateSubtotal().toLocaleString()}</span>
          </div>
          {calculateDiscountAmount() > 0 && (
            <div className="flex justify-between text-yellow-600">
              <span>Discount / الخصم:</span>
              <span className="font-medium">{getCurrencySymbol()} {calculateDiscountAmount().toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>After Discount / بعد الخصم:</span>
            <span className="font-medium">{getCurrencySymbol()} {calculateAfterDiscount().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (15%) / ضريبة القيمة المضافة:</span>
            <span className="font-medium">{getCurrencySymbol()} {calculateVAT().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total / المجموع الكلي:</span>
            <span>{getCurrencySymbol()} {calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-smart-orange hover:bg-smart-orange/90">
          <Save className="h-4 w-4 mr-2" />
          {isEditMode ? 'Update Quotation' : 'Save Quotation'}
        </Button>
        <Button
          onClick={onExportPDF}
          variant="outline"
          className="bg-smart-blue text-white hover:bg-smart-blue/90"
          disabled={isExporting}
          type="button"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>
    </DialogContent>
  );
};

export default EditQuotationDialogContent;
