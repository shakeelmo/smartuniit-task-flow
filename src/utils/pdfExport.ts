
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

// Professional colors matching the sample quotation
const COLORS = {
  headerBlue: [52, 84, 128] as const,      // Dark blue for header
  tableHeaderBlue: [83, 122, 166] as const, // Medium blue for table header
  yellow: [255, 255, 0] as const,          // Yellow for highlights
  darkBlue: [31, 56, 100] as const,        // Very dark blue for text
  black: [0, 0, 0] as const,               // Black text
  white: [255, 255, 255] as const,         // White background
  lightGray: [240, 240, 240] as const,     // Light gray for alternating rows
  orange: [255, 165, 0] as const           // Orange for branding
};

const fireToast = (msg: string, description?: string, variant: "default" | "destructive" = "default") => {
  try {
    // @ts-ignore
    const toast = window?.__LOVABLE_GLOBAL_TOAST__ || (window?.toast ? window.toast : undefined)
    if (toast) {
      toast({ title: msg, description, variant });
    }
  } catch {}
};

const fetchImageBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = function (err) {
      reject('Could not load image for PDF: ' + url);
    };
    img.src = url;
  });
};

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  console.log('Starting professional PDF generation with data:', quotationData);
  let filename: string;
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Load SmartUniverse logo
    let logoBase64: string | null = null;
    try {
      logoBase64 = await fetchImageBase64('/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png');
      console.log('SmartUniverse logo loaded successfully');
    } catch (err) {
      console.warn('Could not load logo, will create text fallback');
    }

    // ---- HEADER SECTION ----
    // Blue triangular design in top-left corner
    pdf.setFillColor(...COLORS.headerBlue);
    pdf.triangle(0, 0, 40, 0, 0, 25, 'F');

    // SmartUniverse logo in top-right
    if (logoBase64) {
      const logoSize = 25;
      pdf.addImage(logoBase64, 'PNG', pageWidth - logoSize - margin, yPosition, logoSize, logoSize);
    } else {
      // Fallback: Create SMART UNIVERSE text
      pdf.setTextColor(...COLORS.orange);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('SMART', pageWidth - 35, yPosition + 8);
      pdf.setTextColor(...COLORS.headerBlue);
      pdf.text('UNIVERSE', pageWidth - 35, yPosition + 16);
    }

    yPosition += 35;

    // VAT Registration Number and Quotation Number header
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('VAT Registration Number: 300155266800003', margin, yPosition);
    
    // Right-aligned quotation number
    const quotationText = `${quotationData.number}`;
    const textWidth = pdf.getTextWidth(quotationText);
    pdf.text(quotationText, pageWidth - margin - textWidth, yPosition);

    yPosition += 15;

    // ---- QUOTATION TITLE BAR ----
    pdf.setFillColor(...COLORS.headerBlue);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
    
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    const titleText = 'Quotation';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition + 8);

    yPosition += 20;

    // ---- CUSTOMER AND QUOTE DETAILS ----
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Prepared for:', margin, yPosition);
    
    // Right side - Date and validity info
    pdf.text(`Date prepared: ${new Date(quotationData.date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    })}`, pageWidth - 80, yPosition);

    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(quotationData.customer.companyName || 'N/A', margin, yPosition);
    
    // Valid until
    pdf.text(`Valid until: ${new Date(quotationData.validUntil).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    })}`, pageWidth - 80, yPosition);

    yPosition += 6;
    pdf.text(quotationData.customer.contactName || 'N/A', margin, yPosition);
    
    // Quotation number
    pdf.text(`Quotation number: ${quotationData.number}`, pageWidth - 80, yPosition);

    yPosition += 6;
    pdf.text(quotationData.customer.phone || 'N/A', margin, yPosition);

    yPosition += 25;

    // ---- PROFESSIONAL TABLE ----
    const tableStartY = yPosition;
    const colWidths = [20, 60, 25, 35, 40]; // S#, Item, Quantity, Unit Price, Total Price
    const rowHeight = 8;

    // Table header
    pdf.setFillColor(...COLORS.tableHeaderBlue);
    pdf.rect(margin, tableStartY, pageWidth - 2 * margin, rowHeight, 'F');
    
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    let currentX = margin + 2;
    const headers = ['S#', 'Item', 'Quantity', 'Unit Price\n(USD)', 'Total Price\n(USD)'];
    headers.forEach((header, index) => {
      if (header.includes('\n')) {
        const lines = header.split('\n');
        pdf.text(lines[0], currentX, tableStartY + 4);
        pdf.text(lines[1], currentX, tableStartY + 7);
      } else {
        pdf.text(header, currentX, tableStartY + 5);
      }
      currentX += colWidths[index];
    });

    // Table rows
    let currentY = tableStartY + rowHeight;
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    quotationData.lineItems.forEach((item, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(...COLORS.lightGray);
        pdf.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
      }

      currentX = margin + 2;
      
      // S# column
      pdf.text((index + 1).toString(), currentX, currentY + 5);
      currentX += colWidths[0];
      
      // Item column
      const itemText = item.service.length > 25 ? item.service.substring(0, 25) + '...' : item.service;
      pdf.text(itemText, currentX, currentY + 5);
      currentX += colWidths[1];
      
      // Quantity column
      pdf.text(item.quantity.toString(), currentX, currentY + 5);
      currentX += colWidths[2];
      
      // Unit Price column
      pdf.text(item.unitPrice.toString(), currentX, currentY + 5);
      currentX += colWidths[3];
      
      // Total Price column
      pdf.text((item.quantity * item.unitPrice).toFixed(2), currentX, currentY + 5);
      
      currentY += rowHeight;
    });

    // ---- TOTALS SECTION ----
    // Total Price in SAR row
    pdf.setFillColor(...COLORS.tableHeaderBlue);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
    
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Total Price in SAR', margin + colWidths[0] + colWidths[1] + 2, currentY + 5);
    pdf.text(quotationData.subtotal.toFixed(2), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, currentY + 5);

    currentY += rowHeight;

    // VAT 15% row
    pdf.setFillColor(...COLORS.yellow);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
    
    pdf.setTextColor(...COLORS.black);
    pdf.text('VAT 15%', margin + colWidths[0] + colWidths[1] + 2, currentY + 5);
    pdf.text(quotationData.vat.toFixed(2), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, currentY + 5);

    currentY += rowHeight;

    // Total Price in SAR (final) row
    pdf.setFillColor(...COLORS.tableHeaderBlue);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
    
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Price in SAR', margin + colWidths[0] + colWidths[1] + 2, currentY + 5);
    pdf.text(quotationData.total.toFixed(2), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, currentY + 5);

    currentY += 25;

    // ---- TERMS AND CONDITIONS SECTION ----
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Terms and conditions', margin, currentY);
    
    // Banking Details header (right side)
    pdf.text('Banking Details', pageWidth - 80, currentY);

    currentY += 10;

    // Terms list
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const terms = [
      '• Payment: 100%',
      '• All prices in Saudi Riyals',
      '• Delivery– 1 Week after PO',
      '• Offers will be confirmed based on your purchase order.',
      '• Product availability and prices are subject to change',
      '  without notice'
    ];

    terms.forEach(term => {
      pdf.text(term, margin + 5, currentY);
      currentY += 5;
    });

    // Banking details (right side)
    let bankingY = currentY - 30;
    pdf.text('Smart Universe Communication and', pageWidth - 80, bankingY);
    bankingY += 4;
    pdf.text('Information Technology.', pageWidth - 80, bankingY);
    bankingY += 4;
    pdf.text('Bank Name: Saudi National Bank', pageWidth - 80, bankingY);
    bankingY += 6;
    pdf.text('IBAN: SA3610000041000000080109', pageWidth - 80, bankingY);
    bankingY += 4;
    pdf.text('Account Number: 41000000080109', pageWidth - 80, bankingY);

    currentY += 15;

    // ---- END OF QUOTATION ----
    pdf.setTextColor(...COLORS.headerBlue);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    const endText = '***End Of Quotation*';
    const endTextWidth = pdf.getTextWidth(endText);
    pdf.text(endText, (pageWidth - endTextWidth) / 2, currentY);

    currentY += 10;

    // Company address
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const addressText = 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295';
    const addressWidth = pdf.getTextWidth(addressText);
    pdf.text(addressText, (pageWidth - addressWidth) / 2, currentY);

    // ---- FOOTER ----
    const footerY = pageHeight - 30;
    
    // Blue triangular design in bottom-right
    pdf.setFillColor(...COLORS.headerBlue);
    pdf.triangle(pageWidth, pageHeight, pageWidth - 40, pageHeight, pageWidth, pageHeight - 25, 'F');

    // Copyright and page number
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Copy Right© Smart Universe for Communication & IT', margin, footerY);
    pdf.text('Page 1 of 1', pageWidth - 25, footerY);

    // Save PDF
    filename = `SmartUniverse_Quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Saving professional PDF as:', filename);
    
    try {
      pdf.save(filename);
      fireToast("Professional PDF Generated", "Quotation exported with standardized format!", "default");
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
