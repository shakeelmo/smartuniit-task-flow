
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import CreateQuotationDialogContent from './CreateQuotationDialogContent';
import { useCreateQuotationState } from './useCreateQuotationState';
import { useExportQuotationPDF } from './useExportQuotationPDF';

interface CreateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationCreated: () => void;
}

const CreateQuotationDialog = ({ open, onOpenChange, onQuotationCreated }: CreateQuotationDialogProps) => {
  const quotationState = useCreateQuotationState();

  const {
    customer, setCustomer,
    customerType, setCustomerType,
    sections, setSections,
    notes, setNotes,
    validUntil, setValidUntil,
    currency, setCurrency,
    customTerms, setCustomTerms,
    discount, setDiscount,
    discountType, setDiscountType,
    isExporting, setIsExporting,
    showUnitColumn, setShowUnitColumn,
    calculateSubtotal,
    calculateDiscountAmount,
    calculateAfterDiscount,
    calculateVAT,
    calculateTotal,
    getCurrencySymbol,
    getCurrencyName,
    getAllLineItems,
    generateQuoteNumber,
  } = quotationState;

  const { handleExportPDF } = useExportQuotationPDF({
    customer,
    sections, // Pass sections instead of flat lineItems
    calculateSubtotal,
    calculateDiscountAmount,
    discountType,
    calculateVAT,
    calculateTotal,
    currency,
    customTerms,
    notes,
    validUntil,
    generateQuoteNumber,
    setIsExporting,
    discount,
  });

  const handleSave = () => {
    console.log('Quotation saved with customer type:', customerType);
    console.log('Sections:', sections);
    onQuotationCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CreateQuotationDialogContent
        customer={customer}
        setCustomer={setCustomer}
        customerType={customerType}
        setCustomerType={setCustomerType}
        currency={currency}
        setCurrency={setCurrency}
        validUntil={validUntil}
        setValidUntil={setValidUntil}
        quoteNumber={generateQuoteNumber()}
        sections={sections}
        setSections={setSections}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discount={discount}
        setDiscount={setDiscount}
        calculateDiscountAmount={calculateDiscountAmount}
        getCurrencySymbol={getCurrencySymbol}
        calculateSubtotal={calculateSubtotal}
        calculateAfterDiscount={calculateAfterDiscount}
        calculateVAT={calculateVAT}
        calculateTotal={calculateTotal}
        customTerms={customTerms}
        setCustomTerms={setCustomTerms}
        notes={notes}
        setNotes={setNotes}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        onOpenChange={onOpenChange}
        showUnitColumn={showUnitColumn}
        setShowUnitColumn={setShowUnitColumn}
      />
    </Dialog>
  );
};
export default CreateQuotationDialog;
