
import { useToast } from '@/hooks/use-toast';
import { generateQuotationPDF } from '@/utils/pdfExport';
import { QuotationData } from '@/utils/pdf/types';

export const useExportQuotationPDF = ({
  customer,
  lineItems,
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
}: any) => {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    toast({ title: "Export button clicked", description: "Starting PDF generation attempt.", variant: "default" });

    if (!customer.companyName.trim()) {
      toast({ title: "Missing Info", description: "Please enter a company name before exporting PDF", variant: "destructive" });
      return;
    }

    if (lineItems.length === 0 || lineItems.every((item: any) => !item.service.trim())) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting PDF", variant: "destructive" });
      return;
    }

    if (calculateTotal() === 0) {
      toast({ title: "Total is zero", description: "Please enter item(s) with a quantity and unit price to calculate total before export.", variant: "destructive" });
      return;
    }

    setIsExporting(true);

    const discountPercent = discountType === 'percentage' ? discount : undefined;

    const quotationData: QuotationData = {
      number: generateQuoteNumber(),
      date: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes,
      ...(discountType === 'percentage' && discountPercent !== undefined && { discountPercent }),
    };

    toast({ title: "Calling PDF exporter", description: "generateQuotationPDF will be invoked", variant: "default" });

    try {
      const success = await generateQuotationPDF(quotationData);
      if (success) {
        toast({ title: "PDF Exported", description: "PDF exported successfully!", variant: "default" });
      } else {
        toast({ title: "Export Failed", description: "PDF was not generated for unknown reasons.", variant: "destructive" });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: "Failed to export PDF", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExporting(false);
      toast({ title: "Export Complete", description: "Export attempt finished.", variant: "default" });
    }
  };

  return { handleExportPDF };
};
