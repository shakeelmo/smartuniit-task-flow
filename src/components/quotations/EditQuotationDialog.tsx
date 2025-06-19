
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import EditQuotationDialogContent from './EditQuotationDialogContent';
import { useEditQuotationState } from './useEditQuotationState';
import { QuotationData } from '@/utils/pdfExport';

interface EditQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationUpdated: () => void;
  quotationData?: QuotationData | null;
}

const EditQuotationDialog = ({ open, onOpenChange, onQuotationUpdated, quotationData }: EditQuotationDialogProps) => {
  const {
    customer, setCustomer,
    customerType, setCustomerType,
    showUnitColumn, setShowUnitColumn,
    lineItems, setLineItems,
    notes, setNotes,
    validUntil, setValidUntil,
    currency, setCurrency,
    discount, setDiscount,
    discountType, setDiscountType,
    customTerms, setCustomTerms,
    isExporting,
    calculateSubtotal,
    calculateDiscountAmount,
    calculateAfterDiscount,
    calculateVAT,
    calculateTotal,
    getCurrencySymbol,
    addLineItem,
    removeLineItem,
    updateLineItem,
    handleExportPDF
  } = useEditQuotationState(quotationData, open);

  const handleSave = () => {
    console.log('Updating quotation:', {
      customer,
      customerType,
      lineItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes,
      validUntil
    });
    onQuotationUpdated();
  };

  const isEditMode = !!quotationData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditQuotationDialogContent
        isEditMode={isEditMode}
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
        quotationData={quotationData}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discount={discount}
        setDiscount={setDiscount}
        calculateSubtotal={calculateSubtotal}
        calculateDiscountAmount={calculateDiscountAmount}
        calculateAfterDiscount={calculateAfterDiscount}
        calculateVAT={calculateVAT}
        calculateTotal={calculateTotal}
        getCurrencySymbol={getCurrencySymbol}
        customTerms={customTerms}
        setCustomTerms={setCustomTerms}
        notes={notes}
        setNotes={setNotes}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
};

export default EditQuotationDialog;
