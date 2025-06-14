
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

// Smart Universe brand colors
const BRAND_COLORS = {
  primary: [255, 107, 53] as const,    // Smart Universe Orange
  secondary: [56, 134, 242] as const,  // Smart Universe Blue
  text: [44, 44, 44] as const,         // Dark gray for body text
  lightGray: [128, 128, 128] as const, // Light gray for secondary text
  background: [248, 249, 250] as const // Very light gray for backgrounds
};

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

// Helper to load image and convert to Base64
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
  console.log('Starting PDF generation with data:', quotationData);
  let filename: string;
  try {
    // Create PDF directly using jsPDF without html2canvas
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // ---- 1. Embed Company Logo ----
    const logoUrl = '/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png';
    let logoHeight = 22, logoWidth = 34;
    try {
      const logoBase64 = await fetchImageBase64(logoUrl);
      pdf.addImage(logoBase64, 'PNG', margin, yPosition, logoWidth, logoHeight);
      console.log('Logo embedded');
    } catch (err) {
      fireToast("Logo missing", "Could not embed company logo, continuing without it.", "destructive");
    }

    // ---- 2. Add Company Text next to Logo with brand colors ----
    pdf.setTextColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('SmartUniit', margin + logoWidth + 8, yPosition + 10, { align: 'left' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.text('Smart Universe Communication and Information Technology', margin + logoWidth + 8, yPosition + 17, { align: 'left' });
    pdf.text('Riyadh, Saudi Arabia', margin + logoWidth + 8, yPosition + 25, { align: 'left' });

    yPosition += logoHeight + 8; // Padding below logo/header

    // ---- 3. Add Quotation Title with brand colors ----
    pdf.setTextColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('QUOTATION', margin, yPosition, { align: 'left' });

    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(quotationData.number, margin, yPosition + 8, { align: 'left' });

    yPosition += 18;

    // ---- 4. LEFT (Customer) and RIGHT (Quote Details) Columns ----
    const colSpace = 100;
    let leftY = yPosition;
    let rightY = yPosition;

    // Left: Customer Info Block
    pdf.setTextColor(BRAND_COLORS.secondary[0], BRAND_COLORS.secondary[1], BRAND_COLORS.secondary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Bill To:', margin, leftY, { align: 'left' });

    leftY += 6;
    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(quotationData.customer.companyName || 'N/A', margin, leftY, { align: 'left' });

    pdf.setFont('helvetica', 'normal');
    leftY += 6;
    pdf.text(quotationData.customer.contactName || 'N/A', margin, leftY, { align: 'left' });
    leftY += 6;
    pdf.text(quotationData.customer.phone || 'N/A', margin, leftY, { align: 'left' });
    leftY += 6;
    pdf.text(quotationData.customer.email || 'N/A', margin, leftY, { align: 'left' });
    leftY += 6;
    pdf.text(`CR: ${quotationData.customer.crNumber || 'N/A'}`, margin, leftY, { align: 'left' });
    leftY += 6;
    pdf.text(`VAT: ${quotationData.customer.vatNumber || 'N/A'}`, margin, leftY, { align: 'left' });

    // Right: Quote Details
    let rightX = margin + colSpace;
    pdf.setTextColor(BRAND_COLORS.secondary[0], BRAND_COLORS.secondary[1], BRAND_COLORS.secondary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Quote Details:', rightX, yPosition, { align: 'left' });

    rightY += 6;
    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    rightY += 6;
    pdf.text(`Date: ${new Date(quotationData.date).toLocaleDateString()}`, rightX, yPosition + 12, { align: 'left' });
    pdf.text(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`, rightX, yPosition + 18, { align: 'left' });

    // Advance below both columns for services table
    yPosition = Math.max(leftY, yPosition + 28) + 10;

    // ---- 5. Services Table with brand colors ----
    pdf.setTextColor(BRAND_COLORS.secondary[0], BRAND_COLORS.secondary[1], BRAND_COLORS.secondary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Services:', margin, yPosition, { align: 'left' });
    yPosition += 7;

    // Table Headers with brand colors
    const tableStartY = yPosition + 3;
    const tableCols = [
      { name: 'Service', width: 35 },
      { name: 'Description', width: 55 },
      { name: 'Qty', width: 15 },
      { name: 'Unit Price', width: 30 },
      { name: 'Total', width: 30 }
    ];
    let tableX = margin;
    
    // Draw header background with primary brand color
    pdf.setFillColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    pdf.rect(margin, tableStartY, pageWidth - 2 * margin, 8, 'F');
    
    // Write header text in white
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    tableX = margin;
    tableCols.forEach((col, i) => {
      pdf.text(col.name, tableX + 2, tableStartY + 6, { align: 'left' });
      tableX += col.width;
    });

    // Reset to brand text color
    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    // Table Rows
    let tableY = tableStartY + 9;
    quotationData.lineItems.forEach((item, idx) => {
      tableX = margin;
      const rowHeight = 10;
      
      // Alternate bg color with light brand background
      if (idx % 2 === 0) {
        pdf.setFillColor(BRAND_COLORS.background[0], BRAND_COLORS.background[1], BRAND_COLORS.background[2]);
        pdf.rect(margin, tableY - 6, pageWidth - 2 * margin, rowHeight, 'F');
      }
      
      // Service, Desc: English only & truncated
      const serviceName = item.service.replace(/[^\x00-\x7F]/g, '').substring(0, 20) + (item.service.length > 20 ? '...' : '');
      const description = item.description.replace(/[^\x00-\x7F]/g, '').substring(0, 30) + (item.description.length > 30 ? '...' : '');
      const fields = [
        serviceName || 'N/A',
        description || 'N/A',
        item.quantity.toString(),
        `SAR ${item.unitPrice.toLocaleString()}`,
        `SAR ${(item.quantity * item.unitPrice).toLocaleString()}`
      ];
      tableCols.forEach((col, cidx) => {
        pdf.text(fields[cidx], tableX + 2, tableY, { align: 'left' });
        tableX += col.width;
      });
      tableY += rowHeight;
    });

    // ---- 6. Totals with brand colors ----
    let totalsY = tableY + 12;
    const totalsX = pageWidth - margin - 65;
    
    pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Subtotal: SAR ${quotationData.subtotal.toLocaleString()}`, totalsX, totalsY, { align: 'left' });
    totalsY += 6;
    pdf.text(`VAT (15%): SAR ${quotationData.vat.toLocaleString()}`, totalsX, totalsY, { align: 'left' });

    // Total with primary brand color
    pdf.setTextColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    totalsY += 8;
    pdf.text(`Total: SAR ${quotationData.total.toLocaleString()}`, totalsX, totalsY, { align: 'left' });

    // ---- 7. Notes Section with brand colors ----
    if (quotationData.notes) {
      let notesY = Math.max(totalsY, tableY + 20) + 10;
      pdf.setTextColor(BRAND_COLORS.secondary[0], BRAND_COLORS.secondary[1], BRAND_COLORS.secondary[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Notes:', margin, notesY, { align: 'left' });

      notesY += 7;
      pdf.setTextColor(BRAND_COLORS.text[0], BRAND_COLORS.text[1], BRAND_COLORS.text[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const notes = quotationData.notes.replace(/[^\x00-\x7F]/g, '');
      pdf.text(notes, margin, notesY, { align: 'left', maxWidth: pageWidth - 2 * margin });
      yPosition = notesY + 10;
    }

    // ---- 8. Footer with brand colors ----
    let footerY = pageHeight - 30;
    pdf.setTextColor(BRAND_COLORS.lightGray[0], BRAND_COLORS.lightGray[1], BRAND_COLORS.lightGray[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}`, pageWidth / 2, footerY + 6, { align: 'center' });

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
