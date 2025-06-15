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

export const addTitleBar = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 12, 'F');
  
  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  
  // Use customer company name as the title, fallback to "Quotation" if empty
  const titleText = quotationData.customer.companyName || 'Quotation';
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

  // Determine if any line items have part numbers
  const hasPartNumbers = quotationData.lineItems.some(item => item.partNumber && item.partNumber.trim());

  // Fixed column widths with proper right-alignment calculations
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  const columnWidths = hasPartNumbers 
    ? [15, 55, 20, 20, 45, 45] // S#, Item, Part#, Qty, Unit Price, Total
    : [15, 75, 20, 45, 45]; // S#, Item, Qty, Unit Price, Total

  // Calculate column positions
  const columnPositions: number[] = [];
  let currentX = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  // Table header
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, tableStartY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  const headers = hasPartNumbers 
    ? ['S#', 'Item', 'Part#', 'Qty', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`]
    : ['S#', 'Item', 'Quantity', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  
  headers.forEach((header, index) => {
    const x = columnPositions[index] + 2;
    if (header.includes('\n')) {
      const lines = header.split('\n');
      pdf.text(lines[0], x, tableStartY + 4);
      pdf.text(lines[1], x, tableStartY + 7);
    } else {
      pdf.text(header, x, tableStartY + 6);
    }
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
      pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
    }

    // S# column - left aligned
    pdf.text((index + 1).toString(), columnPositions[0] + 2, currentY + 6);
    
    // Item column - left aligned with truncation
    const itemText = item.service.length > (hasPartNumbers ? 20 : 30) ? 
      item.service.substring(0, hasPartNumbers ? 20 : 30) + '...' : item.service;
    pdf.text(itemText, columnPositions[1] + 2, currentY + 6);
    
    let colIndex = 2;
    if (hasPartNumbers) {
      // Part Number column - left aligned
      pdf.text(item.partNumber || '-', columnPositions[2] + 2, currentY + 6);
      colIndex = 3;
    }
    
    // Quantity column - center aligned
    const qtyText = item.quantity.toString();
    const qtyWidth = pdf.getTextWidth(qtyText);
    const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
    pdf.text(qtyText, qtyX, currentY + 6);
    colIndex++;
    
    // Unit Price column - right aligned
    const unitPriceText = item.unitPrice.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const unitPriceWidth = pdf.getTextWidth(unitPriceText);
    const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - 3;
    pdf.text(unitPriceText, unitPriceX, currentY + 6);
    colIndex++;
    
    // Total Price column - right aligned
    const totalValue = item.quantity * item.unitPrice;
    const totalText = totalValue.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const totalWidth = pdf.getTextWidth(totalText);
    const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - 3;
    pdf.text(totalText, totalX, currentY + 6);
    
    currentY += PDF_CONFIG.rowHeight;
  });

  return currentY;
};

export const addTotalsSection = (pdf: jsPDF, quotationData: QuotationData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const currencyInfo = getCurrencyInfo(quotationData.currency);
  let currentY = yPosition;

  // Determine if any line items have part numbers to adjust column positioning
  const hasPartNumbers = quotationData.lineItems.some(item => item.partNumber && item.partNumber.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  const columnWidths = hasPartNumbers 
    ? [15, 55, 20, 20, 45, 45] 
    : [15, 75, 20, 45, 45];

  // Calculate positions for totals section - align with table columns
  let labelStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < (hasPartNumbers ? 3 : 2); i++) {
    labelStartX += columnWidths[i];
  }
  labelStartX += 2; // Add small padding

  const valueColumnIndex = hasPartNumbers ? 5 : 4;
  let valueStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < valueColumnIndex; i++) {
    valueStartX += columnWidths[i];
  }
  const valueColumnWidth = columnWidths[valueColumnIndex];

  // Total Price row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX, currentY + 6);
  
  // Right-align the subtotal value
  const subtotalFormatted = quotationData.subtotal.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const subtotalText = `${currencyInfo.symbol} ${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - 3;
  pdf.text(subtotalText, subtotalX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // VAT 15% row
  pdf.setFillColor(...COLORS.yellow);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.black);
  pdf.text('VAT 15%', labelStartX, currentY + 6);
  
  // Right-align the VAT value
  const vatFormatted = quotationData.vat.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const vatText = `${currencyInfo.symbol} ${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - 3;
  pdf.text(vatText, vatX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // Total Price (final) row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX, currentY + 6);
  
  // Right-align the total value
  const totalFormatted = quotationData.total.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const totalText = `${currencyInfo.symbol} ${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - 3;
  pdf.text(totalText, totalX, currentY + 6);

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
