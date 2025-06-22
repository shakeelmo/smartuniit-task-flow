
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import EditQuotationDialogContent from './EditQuotationDialogContent';
import { useEditQuotationState } from './useEditQuotationState';
import { QuotationData } from '@/utils/pdfExport';
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator';

interface EditQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationUpdated: (updatedQuotation?: QuotationData) => void;
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
    handleExportPDF,
    // Data protection states
    isAutoSaving,
    lastAutoSave,
    hasUnsavedChanges,
    clearUnsavedChanges
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

    // Create updated quotation data object
    const updatedQuotationData: QuotationData = {
      number: quotationData?.number || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: quotationData?.date || new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems,
      sections: quotationData?.sections || [],
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes,
      ...(discountType === 'percentage' && { discountPercent: discount }),
    };

    onQuotationUpdated(updatedQuotationData);
    clearUnsavedChanges(quotationData?.number);
  };

  const isEditMode = !!quotationData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed top-4 right-4 z-50">
        <AutoSaveIndicator
          isAutoSaving={isAutoSaving}
          lastSaved={lastAutoSave}
          hasError={false}
        />
      </div>
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
