import { useToast } from '@/hooks/use-toast';
import { generateQuotationPDF } from '@/utils/pdfExport';
import { QuotationData } from '@/utils/pdf/types';

export const useExportQuotationPDF = ({
  customer,
  sections, // Changed from lineItems to sections
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

    // Check if any section has line items with services
    const hasServices = sections.some((section: any) => 
      section.lineItems.some((item: any) => item.service.trim())
    );

    if (!hasServices) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting PDF", variant: "destructive" });
      return;
    }

    if (calculateTotal() === 0) {
      toast({ title: "Total is zero", description: "Please enter item(s) with a quantity and unit price to calculate total before export.", variant: "destructive" });
      return;
    }

    setIsExporting(true);

    const discountPercent = discountType === 'percentage' ? discount : undefined;

    // Convert sections to flat lineItems for backward compatibility AND keep sections
    const flatLineItems = sections.flatMap((section: any) => 
      section.lineItems.map((item: any) => ({
        ...item,
        sectionTitle: section.title
      }))
    );

    const quotationData: QuotationData = {
      number: generateQuoteNumber(),
      date: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems: flatLineItems, // Flat structure for backward compatibility
      sections: sections, // New sectioned structure for enhanced PDF
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
