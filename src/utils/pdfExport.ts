
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

// Enhanced Smart Universe brand colors - RGB values for jsPDF
const BRAND_COLORS = {
  primary: [255, 107, 53] as const,      // Smart Universe Orange
  secondary: [56, 134, 242] as const,    // Smart Universe Blue
  darkText: [33, 33, 33] as const,       // Darker text for better readability
  mediumGray: [89, 89, 89] as const,     // Medium gray for secondary text
  lightGray: [156, 163, 175] as const,   // Light gray for borders
  veryLightGray: [249, 250, 251] as const, // Very light background
  white: [255, 255, 255] as const        // Pure white
};

// Professional styling constants
const STYLING = {
  headerHeight: 60,
  sectionSpacing: 15,
  lineHeight: 6,
  borderWidth: 0.5,
  cornerRadius: 3
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

// Helper function to draw rounded rectangle
const drawRoundedRect = (pdf: jsPDF, x: number, y: number, width: number, height: number, radius: number, style: 'S' | 'F' | 'FD' = 'S') => {
  pdf.roundedRect(x, y, width, height, radius, radius, style);
};

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  console.log('Starting enhanced PDF generation with data:', quotationData);
  let filename: string;
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Load Riyal symbol
    let riyalSymbolBase64: string | null = null;
    try {
      riyalSymbolBase64 = await fetchImageBase64('/lovable-uploads/f1fb4dbc-13f2-4ae8-8282-a916edd635fe.png');
      console.log('Riyal symbol loaded successfully');
    } catch (err) {
      console.warn('Could not load Riyal symbol, will use text fallback');
    }

    // Helper function to add Riyal symbol or fallback text
    const addRiyalSymbol = (x: number, y: number, amount: string, fontSize: number = 10) => {
      if (riyalSymbolBase64) {
        const symbolSize = fontSize * 0.8;
        pdf.addImage(riyalSymbolBase64, 'PNG', x, y - symbolSize + 1, symbolSize, symbolSize);
        pdf.text(amount, x + symbolSize + 2, y);
      } else {
        pdf.text(`SAR ${amount}`, x, y);
      }
    };

    // ---- PROFESSIONAL HEADER SECTION ----
    // Header background with gradient effect
    pdf.setFillColor(...BRAND_COLORS.primary);
    pdf.rect(0, 0, pageWidth, STYLING.headerHeight, 'F');
    
    // Add subtle shadow effect
    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.rect(0, STYLING.headerHeight, pageWidth, 2, 'F');

    // Company Logo with white background for professional look
    const logoUrl = '/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png';
    let logoHeight = 25, logoWidth = 38;
    try {
      const logoBase64 = await fetchImageBase64(logoUrl);
      
      // Add white rounded background behind logo for professional appearance
      pdf.setFillColor(...BRAND_COLORS.white);
      drawRoundedRect(pdf, margin - 2, yPosition + 6, logoWidth + 4, logoHeight + 4, 4, 'F');
      
      // Add the logo on top of the white background
      pdf.addImage(logoBase64, 'PNG', margin, yPosition + 8, logoWidth, logoHeight);
      console.log('Company logo embedded successfully with white background');
    } catch (err) {
      fireToast("Logo missing", "Could not embed company logo", "destructive");
      
      // Fallback: create a white rounded rectangle with company initial
      pdf.setFillColor(...BRAND_COLORS.white);
      drawRoundedRect(pdf, margin - 2, yPosition + 6, logoWidth + 4, logoHeight + 4, 4, 'F');
      pdf.setTextColor(...BRAND_COLORS.primary);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('SU', margin + logoWidth/2, yPosition + logoHeight/2 + 12, { align: 'center' });
    }

    // Company Information with white text on orange background
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('SmartUniit', margin + logoWidth + 12, yPosition + 18);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Smart Universe Communication and Information Technology', margin + logoWidth + 12, yPosition + 26);
    pdf.text('Riyadh, Saudi Arabia', margin + logoWidth + 12, yPosition + 32);

    yPosition = STYLING.headerHeight + 20;

    // ---- QUOTATION TITLE SECTION ----
    pdf.setTextColor(...BRAND_COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('QUOTATION', margin, yPosition);

    // Quotation number with professional styling
    pdf.setFillColor(...BRAND_COLORS.veryLightGray);
    drawRoundedRect(pdf, margin, yPosition + 8, 80, 12, STYLING.cornerRadius, 'F');
    pdf.setTextColor(...BRAND_COLORS.darkText);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(quotationData.number, margin + 4, yPosition + 16);

    yPosition += 35;

    // ---- CUSTOMER AND QUOTE DETAILS SECTION ----
    // Customer Info Card
    pdf.setFillColor(...BRAND_COLORS.white);
    pdf.setDrawColor(...BRAND_COLORS.lightGray);
    drawRoundedRect(pdf, margin, yPosition, 85, 70, STYLING.cornerRadius, 'FD');

    pdf.setTextColor(...BRAND_COLORS.secondary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Bill To:', margin + 6, yPosition + 10);

    pdf.setTextColor(...BRAND_COLORS.darkText);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(quotationData.customer.companyName || 'N/A', margin + 6, yPosition + 18, { maxWidth: 75 });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    let customerY = yPosition + 25;
    pdf.text(quotationData.customer.contactName || 'N/A', margin + 6, customerY);
    customerY += 6;
    pdf.text(quotationData.customer.phone || 'N/A', margin + 6, customerY);
    customerY += 6;
    pdf.text(quotationData.customer.email || 'N/A', margin + 6, customerY, { maxWidth: 75 });
    customerY += 6;
    pdf.text(`CR: ${quotationData.customer.crNumber || 'N/A'}`, margin + 6, customerY);
    customerY += 6;
    pdf.text(`VAT: ${quotationData.customer.vatNumber || 'N/A'}`, margin + 6, customerY);

    // Quote Details Card
    const rightCardX = margin + 100;
    pdf.setFillColor(...BRAND_COLORS.white);
    drawRoundedRect(pdf, rightCardX, yPosition, 70, 70, STYLING.cornerRadius, 'FD');

    pdf.setTextColor(...BRAND_COLORS.secondary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Quote Details:', rightCardX + 6, yPosition + 10);

    pdf.setTextColor(...BRAND_COLORS.darkText);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    let detailsY = yPosition + 18;
    pdf.text(`Date: ${new Date(quotationData.date).toLocaleDateString()}`, rightCardX + 6, detailsY);
    detailsY += 8;
    pdf.text(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`, rightCardX + 6, detailsY);

    yPosition += 85;

    // ---- PROFESSIONAL SERVICES TABLE ----
    pdf.setTextColor(...BRAND_COLORS.secondary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Services & Pricing', margin, yPosition);
    yPosition += 12;

    // Table setup with professional styling
    const tableStartY = yPosition;
    const tableCols = [
      { name: 'Service', width: 40 },
      { name: 'Description', width: 50 },
      { name: 'Qty', width: 20 },
      { name: 'Unit Price', width: 35 },
      { name: 'Total', width: 35 }
    ];

    // Enhanced table header
    pdf.setFillColor(...BRAND_COLORS.secondary);
    drawRoundedRect(pdf, margin, tableStartY, pageWidth - 2 * margin, 10, STYLING.cornerRadius, 'F');
    
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    let tableX = margin + 4;
    tableCols.forEach((col) => {
      pdf.text(col.name, tableX, tableStartY + 7);
      tableX += col.width;
    });

    // Table rows with alternating colors
    pdf.setTextColor(...BRAND_COLORS.darkText);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    let tableY = tableStartY + 12;
    quotationData.lineItems.forEach((item, idx) => {
      const rowHeight = 12;
      
      // Alternating row colors for better readability
      if (idx % 2 === 0) {
        pdf.setFillColor(...BRAND_COLORS.veryLightGray);
        pdf.rect(margin, tableY - 3, pageWidth - 2 * margin, rowHeight, 'F');
      }
      
      tableX = margin + 4;
      const serviceName = item.service.substring(0, 25) + (item.service.length > 25 ? '...' : '');
      const description = item.description.substring(0, 35) + (item.description.length > 35 ? '...' : '');
      
      pdf.text(serviceName, tableX, tableY + 4);
      tableX += tableCols[0].width;
      pdf.text(description, tableX, tableY + 4);
      tableX += tableCols[1].width;
      pdf.text(item.quantity.toString(), tableX, tableY + 4);
      tableX += tableCols[2].width;
      
      // Unit price with Riyal symbol
      addRiyalSymbol(tableX, tableY + 4, item.unitPrice.toLocaleString(), 9);
      tableX += tableCols[3].width;
      
      // Total with Riyal symbol
      addRiyalSymbol(tableX, tableY + 4, (item.quantity * item.unitPrice).toLocaleString(), 9);
      
      tableY += rowHeight;
    });

    // ---- PROFESSIONAL TOTALS SECTION ----
    yPosition = tableY + 15;
    const totalsBoxX = pageWidth - margin - 80;
    const totalsBoxY = yPosition;
    
    // Totals background card
    pdf.setFillColor(...BRAND_COLORS.white);
    pdf.setDrawColor(...BRAND_COLORS.lightGray);
    drawRoundedRect(pdf, totalsBoxX, totalsBoxY, 75, 45, STYLING.cornerRadius, 'FD');

    pdf.setTextColor(...BRAND_COLORS.darkText);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    let totalsY = totalsBoxY + 10;
    pdf.text('Subtotal:', totalsBoxX + 4, totalsY);
    addRiyalSymbol(totalsBoxX + 35, totalsY, quotationData.subtotal.toLocaleString(), 10);
    
    totalsY += 8;
    pdf.text('VAT (15%):', totalsBoxX + 4, totalsY);
    addRiyalSymbol(totalsBoxX + 35, totalsY, quotationData.vat.toLocaleString(), 10);

    // Total with emphasis
    totalsY += 10;
    pdf.setFillColor(...BRAND_COLORS.primary);
    pdf.rect(totalsBoxX + 2, totalsY - 6, 70, 12, 'F');
    
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('TOTAL:', totalsBoxX + 4, totalsY + 2);
    addRiyalSymbol(totalsBoxX + 35, totalsY + 2, quotationData.total.toLocaleString(), 12);

    // ---- NOTES SECTION ----
    if (quotationData.notes) {
      yPosition = Math.max(yPosition, totalsBoxY + 60);
      
      pdf.setFillColor(...BRAND_COLORS.veryLightGray);
      const notesHeight = 25;
      drawRoundedRect(pdf, margin, yPosition, pageWidth - 2 * margin, notesHeight, STYLING.cornerRadius, 'F');
      
      pdf.setTextColor(...BRAND_COLORS.secondary);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Notes:', margin + 6, yPosition + 8);

      pdf.setTextColor(...BRAND_COLORS.darkText);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const cleanNotes = quotationData.notes.replace(/[^\x00-\x7F]/g, '');
      pdf.text(cleanNotes, margin + 6, yPosition + 16, { maxWidth: pageWidth - 2 * margin - 12 });
    }

    // ---- PROFESSIONAL FOOTER ----
    const footerY = pageHeight - 25;
    pdf.setFillColor(...BRAND_COLORS.primary);
    pdf.rect(0, footerY - 5, pageWidth, 30, 'F');
    
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Thank you for choosing SmartUniit', pageWidth / 2, footerY + 3, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text(`This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}`, pageWidth / 2, footerY + 10, { align: 'center' });

    // Save PDF
    filename = `SmartUniit_Quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Saving enhanced PDF as:', filename);
    
    try {
      pdf.save(filename);
      fireToast("Professional PDF Generated", "Enhanced quotation exported successfully!", "default");
      console.log('Enhanced PDF generation completed successfully');
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
        fireToast("PDF opened in new tab", "Enhanced quotation ready!", "default");
        return true;
      } catch (fallbackErr) {
        fireToast("Export failed", "Could not generate PDF", "destructive");
        console.error('Fallback PDF export failed:', fallbackErr);
        return false;
      }
    }
  } catch (error) {
    console.error('Error in enhanced PDF generation:', error);
    fireToast("PDF generation error", error instanceof Error ? error.message : String(error), "destructive");
    throw new Error(`Enhanced PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
