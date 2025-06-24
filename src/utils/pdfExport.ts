
import jsPDF from 'jspdf';
import { QuotationData } from './pdf/types';
import { fireToast, fetchImageBase64 } from './pdf/helpers';
import { 
  addHeader, 
  addTitleBar, 
  addCustomerDetails, 
  addTable, 
  addTotalsSection, 
  addTermsAndBanking, 
  addFooter 
} from './pdf/sections';

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  console.log('Starting professional PDF generation with data:', quotationData);
  let filename: string;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 0;

    // Load SmartUniverse logo
    let logoBase64: string | null = null;
    try {
      logoBase64 = await fetchImageBase64('/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png');
      console.log('SmartUniverse logo loaded successfully');
    } catch (err) {
      console.warn('Could not load logo, will create text fallback');
    }

    // Generate PDF sections
    yPosition = addHeader(pdf, quotationData, logoBase64);
    yPosition = addTitleBar(pdf, quotationData, yPosition);
    yPosition = addCustomerDetails(pdf, quotationData, yPosition);
    yPosition = addTable(pdf, quotationData, yPosition);
    yPosition = addTotalsSection(pdf, quotationData, yPosition);
    yPosition = addTermsAndBanking(pdf, quotationData, yPosition);
    addFooter(pdf, yPosition);

    // Generate filename based on customer company name
    const customerName = quotationData.customer.companyName || 'Quotation';
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    filename = `${sanitizedCustomerName}_Quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Saving professional PDF as:', filename);
    
    try {
      pdf.save(filename);
      fireToast("Professional PDF Generated", "Quotation exported with customer name!", "default");
      console.log('Professional PDF generation completed successfully');
      return true;
    } catch (saveErr) {
      console.error('Error saving PDF:', saveErr);
      
      // Fallback method
      try {
        const blob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          fireToast("Download blocked", "Check your popup blocker settings", "destructive");
          throw new Error('Popup blocked');
        }
        fireToast("PDF opened in new tab", "Professional quotation ready!", "default");
        return true;
      } catch (fallbackErr) {
        fireToast("Export failed", "Could not generate PDF", "destructive");
        console.error('Fallback PDF export failed:', fallbackErr);
        return false;
      }
    }
  } catch (error) {
    console.error('Error in professional PDF generation:', error);
    fireToast("PDF generation error", error instanceof Error ? error.message : String(error), "destructive");
    throw new Error(`Professional PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Re-export types for backward compatibility
export type { QuotationData } from './pdf/types';
