
import jsPDF from 'jspdf';
import { QuotationData } from './types';
import { COLORS, PDF_CONFIG, COLUMN_WIDTHS } from './constants';
import { addTextWithWrapping, getCurrencyInfo, formatDate } from './helpers';

export const addHeader = (pdf: jsPDF, quotationData: QuotationData, logoBase64: string | null) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Blue triangular design in top-left corner
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.triangle(0, 0, 40, 0, 0, 25, 'F');

  // SmartUniverse logo in top-right
  if (logoBase64) {
    pdf.addImage(logoBase64, 'PNG', pageWidth - PDF_CONFIG.logoSize - PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.logoSize, PDF_CONFIG.logoSize);
  } else {
    // Fallback: Create SMART UNIVERSE text
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.title);
    pdf.text('SMART', pageWidth - 35, yPosition + 8);
    pdf.setTextColor(...COLORS.headerBlue);
    pdf.text('UNIVERSE', pageWidth - 35, yPosition + 16);
  }

  yPosition += 35;

  // VAT Registration Number and Quotation Number header
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('VAT Registration Number: 300155266800003', PDF_CONFIG.pageMargin, yPosition);
  
  // Right-aligned quotation number
  const quotationText = `${quotationData.number}`;
  const textWidth = pdf.getTextWidth(quotationText);
  pdf.text(quotationText, pageWidth - PDF_CONFIG.pageMargin - textWidth, yPosition);

  return yPosition + 15;
};

export const addTitleBar = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 12, 'F');
  
  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const titleText = 'Quotation';
  const titleWidth = pdf.getTextWidth(titleText);
  pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition + 8);

  return yPosition + 20;
};

export const addCustomerDetails = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Prepared for:', PDF_CONFIG.pageMargin, yPosition);
  
  // Right side - Date and validity info
  pdf.text(`Date prepared: ${formatDate(quotationData.date)}`, pageWidth - 90, yPosition);

  yPosition += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(quotationData.customer.companyName || 'N/A', PDF_CONFIG.pageMargin, yPosition);
  
  // Valid until
  pdf.text(`Valid until: ${formatDate(quotationData.validUntil)}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(quotationData.customer.contactName || 'N/A', PDF_CONFIG.pageMargin, yPosition);
  
  // Quotation number
  pdf.text(`Quotation number: ${quotationData.number}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(quotationData.customer.phone || 'N/A', PDF_CONFIG.pageMargin, yPosition);

  return yPosition + 25;
};

export const addTable = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableStartY = yPosition;
  const currencyInfo = getCurrencyInfo(quotationData.currency);

  // Table header
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, tableStartY, pageWidth - 2 * PDF_CONFIG.pageMargin, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  let currentX = PDF_CONFIG.pageMargin + 2;
  const headers = ['S#', 'Item', 'Quantity', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  headers.forEach((header, index) => {
    if (header.includes('\n')) {
      const lines = header.split('\n');
      pdf.text(lines[0], currentX, tableStartY + 4);
      pdf.text(lines[1], currentX, tableStartY + 7);
    } else {
      pdf.text(header, currentX, tableStartY + 6);
    }
    currentX += COLUMN_WIDTHS[index];
  });

  // Table rows
  let currentY = tableStartY + PDF_CONFIG.rowHeight;
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  quotationData.lineItems.forEach((item, index) => {
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, PDF_CONFIG.rowHeight, 'F');
    }

    currentX = PDF_CONFIG.pageMargin + 2;
    
    // S# column
    pdf.text((index + 1).toString(), currentX, currentY + 6);
    currentX += COLUMN_WIDTHS[0];
    
    // Item column - wrap text if too long
    const itemText = item.service.length > 30 ? item.service.substring(0, 30) + '...' : item.service;
    pdf.text(itemText, currentX, currentY + 6);
    currentX += COLUMN_WIDTHS[1];
    
    // Quantity column
    pdf.text(item.quantity.toString(), currentX + 5, currentY + 6);
    currentX += COLUMN_WIDTHS[2];
    
    // Unit Price column
    pdf.text(item.unitPrice.toFixed(2), currentX + 5, currentY + 6);
    currentX += COLUMN_WIDTHS[3];
    
    // Total Price column
    pdf.text((item.quantity * item.unitPrice).toFixed(2), currentX + 5, currentY + 6);
    
    currentY += PDF_CONFIG.rowHeight;
  });

  return currentY;
};

export const addTotalsSection = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const currencyInfo = getCurrencyInfo(quotationData.currency);
  let currentY = yPosition;

  // Total Price row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  pdf.text(`Total Price in ${currencyInfo.name}`, PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + 2, currentY + 6);
  pdf.text(`${currencyInfo.symbol} ${quotationData.subtotal.toFixed(2)}`, PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2] + COLUMN_WIDTHS[3] + 7, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // VAT 15% row
  pdf.setFillColor(...COLORS.yellow);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.black);
  pdf.text('VAT 15%', PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + 2, currentY + 6);
  pdf.text(`${currencyInfo.symbol} ${quotationData.vat.toFixed(2)}`, PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2] + COLUMN_WIDTHS[3] + 7, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // Total Price (final) row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Price in ${currencyInfo.name}`, PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + 2, currentY + 6);
  pdf.text(`${currencyInfo.symbol} ${quotationData.total.toFixed(2)}`, PDF_CONFIG.pageMargin + COLUMN_WIDTHS[0] + COLUMN_WIDTHS[1] + COLUMN_WIDTHS[2] + COLUMN_WIDTHS[3] + 7, currentY + 6);

  return currentY + 25;
};

export const addTermsAndBanking = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  // Terms and conditions header
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Terms and conditions', PDF_CONFIG.pageMargin, currentY);
  
  // Banking Details header (right side)
  pdf.text('Banking Details', pageWidth - 90, currentY);

  currentY += 10;

  // Custom Terms list
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  const termLines = quotationData.customTerms.split('\n');
  
  termLines.forEach(term => {
    if (term.trim()) {
      const processedTerm = term.startsWith('•') ? term : `• ${term}`;
      currentY = addTextWithWrapping(pdf, processedTerm, PDF_CONFIG.pageMargin + 2, currentY, pageWidth - 120, PDF_CONFIG.lineHeight);
      currentY += 1; // Small gap between terms
    }
  });

  // Banking details (right side)
  let bankingY = currentY - (termLines.length * 5);
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  bankingY = addTextWithWrapping(pdf, 'Smart Universe Communication and Information Technology.', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'Bank Name: Saudi National Bank', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'IBAN: SA3610000041000000080109', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'Account Number: 41000000080109', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);

  return currentY + 15;
};

export const addFooter = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // End of quotation
  pdf.setTextColor(...COLORS.headerBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const endText = '***End Of Quotation***';
  const endTextWidth = pdf.getTextWidth(endText);
  pdf.text(endText, (pageWidth - endTextWidth) / 2, yPosition);

  yPosition += 10;

  // Company address
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  const addressText = 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295';
  const addressWidth = pdf.getTextWidth(addressText);
  pdf.text(addressText, (pageWidth - addressWidth) / 2, yPosition);

  // Footer section
  const footerY = pageHeight - 30;
  
  // Blue triangular design in bottom-right
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.triangle(pageWidth, pageHeight, pageWidth - 40, pageHeight, pageWidth, pageHeight - 25, 'F');

  // Copyright and page number
  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  pdf.text('Copy Right© Smart Universe for Communication & IT', PDF_CONFIG.pageMargin, footerY);
  pdf.text('Page 1 of 1', pageWidth - 25, footerY);
};
