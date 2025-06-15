
import jsPDF from 'jspdf';
import { InvoiceData } from './pdf/invoiceTypes';
import { fireToast, fetchImageBase64 } from './pdf/helpers';
import { 
  addInvoiceHeader, 
  addInvoiceTitleBar, 
  addInvoiceCustomerDetails, 
  addInvoiceTable, 
  addInvoiceTotalsSection, 
  addInvoiceTermsAndBanking, 
  addInvoiceFooter 
} from './pdf/invoiceSections';

export const generateInvoicePDF = async (invoiceData: InvoiceData) => {
  console.log('Starting invoice PDF generation with data:', invoiceData);
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
    yPosition = addInvoiceHeader(pdf, invoiceData, logoBase64);
    yPosition = addInvoiceTitleBar(pdf, invoiceData, yPosition);
    yPosition = addInvoiceCustomerDetails(pdf, invoiceData, yPosition);
    yPosition = addInvoiceTable(pdf, invoiceData, yPosition);
    yPosition = addInvoiceTotalsSection(pdf, invoiceData, yPosition);
    yPosition = addInvoiceTermsAndBanking(pdf, invoiceData, yPosition);
    addInvoiceFooter(pdf, yPosition);

    // Generate filename based on customer company name
    const customerName = invoiceData.customer.companyName || 'Invoice';
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    filename = `${sanitizedCustomerName}_Invoice_${invoiceData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Saving invoice PDF as:', filename);
    
    try {
      pdf.save(filename);
      fireToast("Invoice PDF Generated", "Invoice exported successfully!", "default");
      console.log('Invoice PDF generation completed successfully');
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
        fireToast("PDF opened in new tab", "Invoice ready!", "default");
        return true;
      } catch (fallbackErr) {
        fireToast("Export failed", "Could not generate PDF", "destructive");
        console.error('Fallback PDF export failed:', fallbackErr);
        return false;
      }
    }
  } catch (error) {
    console.error('Error in invoice PDF generation:', error);
    fireToast("PDF generation error", error instanceof Error ? error.message : String(error), "destructive");
    throw new Error(`Invoice PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
