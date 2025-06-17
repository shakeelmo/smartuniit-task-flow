
import { useToast } from '@/hooks/use-toast';
import { generateQuotationPDF } from '@/utils/pdfExport';
import { generateQuotationWord } from '@/utils/wordExport';
import { QuotationData } from '@/utils/pdf/types';

export const useExportQuotationPDF = ({
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
}: any) => {
  const { toast } = useToast();

  const validateQuotationData = () => {
    if (!customer.companyName.trim()) {
      toast({ title: "Missing Info", description: "Please enter a company name before exporting", variant: "destructive" });
      return false;
    }

    const hasServices = sections.some((section: any) => 
      section.lineItems.some((item: any) => item.service.trim())
    );

    if (!hasServices) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting", variant: "destructive" });
      return false;
    }

    if (calculateTotal() === 0) {
      toast({ title: "Total is zero", description: "Please enter item(s) with a quantity and unit price to calculate total before export.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const prepareQuotationData = (): QuotationData => {
    const discountPercent = discountType === 'percentage' ? discount : undefined;
    const flatLineItems = sections.flatMap((section: any) => 
      section.lineItems.map((item: any) => ({
        ...item,
        sectionTitle: section.title
      }))
    );

    return {
      number: generateQuoteNumber(),
      date: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems: flatLineItems,
      sections: sections,
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
  };

  const handleExportPDF = async () => {
    if (!validateQuotationData()) return;

    setIsExporting(true);
    const quotationData = prepareQuotationData();

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
    }
  };

  const handleExportWord = async () => {
    if (!validateQuotationData()) return;

    setIsExporting(true);
    const quotationData = prepareQuotationData();

    try {
      const success = await generateQuotationWord(quotationData);
      if (success) {
        toast({ title: "Word Document Exported", description: "Word document exported successfully!", variant: "default" });
      } else {
        toast({ title: "Export Failed", description: "Word document was not generated.", variant: "destructive" });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: "Failed to export Word", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExportPDF, handleExportWord };
};
