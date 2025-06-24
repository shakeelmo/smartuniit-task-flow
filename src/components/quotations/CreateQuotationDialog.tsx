
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import CreateQuotationDialogContent from './CreateQuotationDialogContent';
import { useCreateQuotationState } from './useCreateQuotationState';
import { useExportQuotationPDF } from './useExportQuotationPDF';
import { QuotationData } from '@/utils/pdfExport';

interface CreateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationCreated: (quotationData?: QuotationData) => void;
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

  const { handleExportPDF, handleExportWord } = useExportQuotationPDF({
    customer,
    sections,
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
    
    // Create quotation data object
    const quotationData: QuotationData = {
      number: generateQuoteNumber(),
      date: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems: getAllLineItems(),
      sections: sections,
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
    
    onQuotationCreated(quotationData);
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
        onExportWord={handleExportWord}
        isExporting={isExporting}
        onOpenChange={onOpenChange}
        showUnitColumn={showUnitColumn}
        setShowUnitColumn={setShowUnitColumn}
      />
    </Dialog>
  );
};

export default CreateQuotationDialog;
