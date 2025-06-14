
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotationData {
  number: string;
  date: string;
  validUntil: string;
  customer: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    crNumber: string;
    vatNumber: string;
  };
  lineItems: Array<{
    service: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
}

// Optional, but provides in-module toasting for debugging status
const fireToast = (msg: string, description?: string, variant: "default" | "destructive" = "default") => {
  // Dynamically import use-toast if it exists in this context (it is globally available in hooks)
  // The standard usage expects it in a React hook, but we'll fallback to window if required.
  try {
    // @ts-ignore
    const toast = window?.__LOVABLE_GLOBAL_TOAST__ || (window?.toast ? window.toast : undefined)
    if (toast) {
      toast({ title: msg, description, variant });
    }
  } catch {}
};

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  console.log('Starting PDF generation with data:', quotationData);
  let filename: string;
  try {
    // Create PDF directly using jsPDF without html2canvas
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.35);
      } else {
        pdf.text(text, x, y);
        return y + (fontSize * 0.35);
      }
    };

    // Add company header
    pdf.setTextColor(255, 107, 53); // Orange color
    yPosition = addText('SmartUniit', pageWidth / 2, yPosition, undefined, 24, true);
    pdf.setTextColor(0, 0, 0);
    yPosition = addText('Smart Universe Communication and Information Technology', pageWidth / 2, yPosition + 5, undefined, 12);
    yPosition = addText('Riyadh, Saudi Arabia', pageWidth / 2, yPosition + 5, undefined, 12);
    yPosition += 20;

    // Add quotation title
    pdf.setTextColor(255, 107, 53);
    yPosition = addText('QUOTATION / عرض سعر', pageWidth / 2, yPosition, undefined, 20, true);
    pdf.setTextColor(0, 0, 0);
    yPosition = addText(quotationData.number, pageWidth / 2, yPosition + 5, undefined, 14, true);
    yPosition += 20;

    // Customer information section
    pdf.setTextColor(255, 107, 53);
    yPosition = addText('Bill To:', margin, yPosition, undefined, 14, true);
    pdf.setTextColor(0, 0, 0);
    yPosition += 5;
    yPosition = addText(quotationData.customer.companyName || 'N/A', margin, yPosition, undefined, 12, true);
    yPosition = addText(quotationData.customer.contactName || 'N/A', margin, yPosition + 5, undefined, 12);
    yPosition = addText(quotationData.customer.phone || 'N/A', margin, yPosition + 5, undefined, 12);
    yPosition = addText(quotationData.customer.email || 'N/A', margin, yPosition + 5, undefined, 12);
    yPosition = addText(`CR: ${quotationData.customer.crNumber || 'N/A'}`, margin, yPosition + 5, undefined, 12);
    yPosition = addText(`VAT: ${quotationData.customer.vatNumber || 'N/A'}`, margin, yPosition + 5, undefined, 12);

    // Quote details (right side)
    const rightColumnX = pageWidth / 2 + 10;
    let rightYPosition = yPosition - 40; // Align with Bill To section
    pdf.setTextColor(255, 107, 53);
    rightYPosition = addText('Quote Details:', rightColumnX, rightYPosition, undefined, 14, true);
    pdf.setTextColor(0, 0, 0);
    rightYPosition += 5;
    rightYPosition = addText(`Date: ${new Date(quotationData.date).toLocaleDateString()}`, rightColumnX, rightYPosition + 5, undefined, 12);
    rightYPosition = addText(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`, rightColumnX, rightYPosition + 5, undefined, 12);

    yPosition += 30;

    // Line items table
    pdf.setTextColor(255, 107, 53);
    yPosition = addText('Services:', margin, yPosition, undefined, 14, true);
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Table headers
    const tableStartY = yPosition;
    const colWidths = [40, 60, 20, 30, 30];
    const colX = [margin, margin + 40, margin + 100, margin + 120, margin + 150];

    pdf.setFillColor(255, 107, 53);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Service', colX[0] + 2, yPosition + 2);
    pdf.text('Description', colX[1] + 2, yPosition + 2);
    pdf.text('Qty', colX[2] + 2, yPosition + 2);
    pdf.text('Unit Price', colX[3] + 2, yPosition + 2);
    pdf.text('Total', colX[4] + 2, yPosition + 2);

    yPosition += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    // Table rows
    quotationData.lineItems.forEach((item, index) => {
      const rowHeight = 15;
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, rowHeight, 'F');
      }
      pdf.setFontSize(9);
      // Service name (truncated if too long)
      const serviceName = item.service.length > 20 ? item.service.substring(0, 20) + '...' : item.service;
      pdf.text(serviceName || 'N/A', colX[0] + 2, yPosition + 2);
      // Description (truncated if too long)
      const description = item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description;
      pdf.text(description || 'N/A', colX[1] + 2, yPosition + 2);
      pdf.text(item.quantity.toString(), colX[2] + 2, yPosition + 2);
      pdf.text(`﷼ ${item.unitPrice.toLocaleString()}`, colX[3] + 2, yPosition + 2);
      pdf.text(`﷼ ${(item.quantity * item.unitPrice).toLocaleString()}`, colX[4] + 2, yPosition + 2);
      yPosition += rowHeight;
    });

    yPosition += 20;

    // Totals section
    const totalsX = pageWidth - 80;
    yPosition = addText(`Subtotal: ﷼ ${quotationData.subtotal.toLocaleString()}`, totalsX, yPosition, undefined, 12);
    yPosition = addText(`VAT (15%): ﷼ ${quotationData.vat.toLocaleString()}`, totalsX, yPosition + 8, undefined, 12);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    yPosition = addText(`Total: ﷼ ${quotationData.total.toLocaleString()}`, totalsX, yPosition + 12, undefined, 14, true);

    // Notes section
    if (quotationData.notes) {
      yPosition += 30;
      pdf.setTextColor(255, 107, 53);
      yPosition = addText('Notes:', margin, yPosition, undefined, 14, true);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(quotationData.notes, margin, yPosition + 8, pageWidth - 2 * margin, 11);
    }

    // Footer
    yPosition = pageHeight - 40;
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(10);
    pdf.text('Thank you for your business! / شكراً لثقتكم بنا', pageWidth / 2, yPosition, { align: 'center' });
    pdf.text(`This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}`, pageWidth / 2, yPosition + 8, { align: 'center' });

    filename = `quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Preparing to save PDF as:', filename);
    fireToast("Preparing to save PDF", `Filename: ${filename}`, "default");

    // Attempt the normal built-in save method, catch file system issues
    let saveSuccess = false;
    try {
      pdf.save(filename);
      console.log('pdf.save() called - check your browser for download or popup block');
      fireToast("PDF save() called", "Check for browser download or popup.", "default");
      saveSuccess = true;
    } catch (saveErr) {
      console.error('Error on pdf.save():', saveErr);
      fireToast("Error saving PDF using save()", saveErr instanceof Error ? saveErr.message : String(saveErr), "destructive");
    }

    // Additional check: Attempt to open using Blob method if normal save fails
    // (This helps in some strict iframe sandboxes or custom browser configs)
    if (!saveSuccess) {
      try {
        const blob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          fireToast("Download blocked!", "Check your popup blocker.", "destructive");
          throw new Error('Could not open window (possibly blocked by browser popup settings)');
        }
        fireToast("PDF opened in new tab", "Check your browser for popups.", "default");
        saveSuccess = true;
      } catch (fallbackErr) {
        fireToast("PDF fallback failed", fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr), "destructive");
        console.error('Error on PDF fallback download:', fallbackErr);
      }
    }

    if (saveSuccess) {
      fireToast("PDF Exported", "PDF exported and should be downloaded!", "default");
      console.log('PDF generation completed successfully');
      return true;
    } else {
      fireToast("Export Failed", "Could not export PDF.", "destructive");
      return false;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    fireToast("PDF export error", error instanceof Error ? error.message : String(error), "destructive");
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
