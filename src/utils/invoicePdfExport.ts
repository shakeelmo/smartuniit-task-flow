
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
  
  try {
    // Validate invoice data
    if (!invoiceData.number || !invoiceData.customer.companyName) {
      const errorMsg = 'Invoice number and customer company name are required';
      console.error(errorMsg);
      fireToast("Validation Error", errorMsg, "destructive");
      return false;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 0;

    // Load SmartUniverse logo with better error handling
    let logoBase64: string | null = null;
    try {
      logoBase64 = await fetchImageBase64('/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png');
      console.log('SmartUniverse logo loaded successfully');
    } catch (err) {
      console.warn('Could not load logo, will create text fallback:', err);
      logoBase64 = null;
    }

    console.log('Generating PDF sections...');

    // Generate PDF sections with error handling for each section
    try {
      yPosition = addInvoiceHeader(pdf, invoiceData, logoBase64);
      console.log('Header added, yPosition:', yPosition);
      
      yPosition = addInvoiceTitleBar(pdf, invoiceData, yPosition);
      console.log('Title bar added, yPosition:', yPosition);
      
      yPosition = addInvoiceCustomerDetails(pdf, invoiceData, yPosition);
      console.log('Customer details added, yPosition:', yPosition);
      
      yPosition = addInvoiceTable(pdf, invoiceData, yPosition);
      console.log('Table added, yPosition:', yPosition);
      
      yPosition = addInvoiceTotalsSection(pdf, invoiceData, yPosition);
      console.log('Totals section added, yPosition:', yPosition);
      
      yPosition = addInvoiceTermsAndBanking(pdf, invoiceData, yPosition);
      console.log('Terms and banking added, yPosition:', yPosition);
      
      addInvoiceFooter(pdf, yPosition);
      console.log('Footer added');
    } catch (sectionError) {
      console.error('Error generating PDF sections:', sectionError);
      fireToast("PDF Generation Error", "Error creating PDF sections", "destructive");
      return false;
    }

    // Generate filename
    const customerName = invoiceData.customer.companyName || 'Invoice';
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedCustomerName}_Invoice_${invoiceData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Generated filename:', filename);
    
    // Try to save the PDF
    try {
      console.log('Attempting to save PDF...');
      pdf.save(filename);
      fireToast("Success!", "Invoice PDF downloaded successfully", "default");
      console.log('Invoice PDF generation completed successfully');
      return true;
    } catch (saveErr) {
      console.error('Error saving PDF with jsPDF save():', saveErr);
      
      // Fallback method - create blob and download
      try {
        console.log('Trying fallback download method...');
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        fireToast("Success!", "Invoice PDF downloaded successfully", "default");
        console.log('PDF downloaded using fallback method');
        return true;
      } catch (fallbackErr) {
        console.error('Fallback PDF download failed:', fallbackErr);
        
        // Final fallback - open in new window
        try {
          console.log('Trying final fallback - open in new window...');
          const pdfDataUri = pdf.output('datauristring');
          const win = window.open('', '_blank');
          if (win) {
            win.location.href = pdfDataUri;
            fireToast("PDF Opened", "Invoice PDF opened in new tab", "default");
            return true;
          } else {
            throw new Error('Popup blocked');
          }
        } catch (finalErr) {
          console.error('All PDF export methods failed:', finalErr);
          fireToast("Export Failed", "Could not export PDF. Please check your browser settings.", "destructive");
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Critical error in invoice PDF generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    fireToast("PDF Generation Failed", errorMessage, "destructive");
    return false;
  }
};
