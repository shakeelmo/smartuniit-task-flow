
import jsPDF from 'jspdf';
import { InvoiceData } from './invoiceTypes';
import { COLORS, PDF_CONFIG } from './constants';
import { addTextWithWrapping, formatDate } from './helpers';

export const addInvoiceHeader = (pdf: jsPDF, invoiceData: InvoiceData, logoBase64: string | null) => {
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

  // VAT Registration Number and Invoice Number header
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('VAT Registration Number: 300155266800003', PDF_CONFIG.pageMargin, yPosition);
  
  // Right-aligned invoice number
  const invoiceText = `${invoiceData.number}`;
  const textWidth = pdf.getTextWidth(invoiceText);
  pdf.text(invoiceText, pageWidth - PDF_CONFIG.pageMargin - textWidth, yPosition);

  return yPosition + 15;
};

export const addInvoiceTitleBar = (pdf: jsPDF, invoiceData: InvoiceData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 12, 'F');
  
  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  
  // Use customer company name as the title, fallback to "Invoice" if empty
  const titleText = invoiceData.customer.companyName || 'Invoice';
  const titleWidth = pdf.getTextWidth(titleText);
  pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition + 8);

  return yPosition + 20;
};

export const addInvoiceCustomerDetails = (pdf: jsPDF, invoiceData: InvoiceData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Bill to:', PDF_CONFIG.pageMargin, yPosition);
  
  // Right side - Date and due date info
  pdf.text(`Invoice Date: ${formatDate(invoiceData.date)}`, pageWidth - 90, yPosition);

  yPosition += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(invoiceData.customer.companyName || 'N/A', PDF_CONFIG.pageMargin, yPosition);
  
  // Due date
  pdf.text(`Due Date: ${formatDate(invoiceData.dueDate)}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(invoiceData.customer.contactName || 'N/A', PDF_CONFIG.pageMargin, yPosition);
  
  // Invoice number
  pdf.text(`Invoice Number: ${invoiceData.number}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(invoiceData.customer.phone || 'N/A', PDF_CONFIG.pageMargin, yPosition);

  return yPosition + 25;
};

export const addInvoiceTable = (pdf: jsPDF, invoiceData: InvoiceData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableStartY = yPosition;

  // Calculate available table width with proper margins
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  
  // Fixed column widths for invoice table
  const columnWidths = [12, 80, 18, 30, 35]; // S#, Description, Qty, Unit Price, Total

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
  
  const headers = ['S#', 'Description', 'Quantity', `Unit Price\n(${invoiceData.currency})`, `Total Price\n(${invoiceData.currency})`];
  
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

  invoiceData.lineItems.forEach((item, index) => {
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
    }

    // S# column - left aligned
    pdf.text((index + 1).toString(), columnPositions[0] + 2, currentY + 6);
    
    // Description column - left aligned with proper text handling
    const maxDescLength = 35;
    const cleanDescText = String(item.description || '').replace(/[^\x20-\x7E]/g, '');
    const descText = cleanDescText.length > maxDescLength ? 
      cleanDescText.substring(0, maxDescLength) + '...' : cleanDescText;
    pdf.text(descText, columnPositions[1] + 2, currentY + 6);
    
    // Quantity column - center aligned
    const qtyText = item.quantity.toString();
    const qtyWidth = pdf.getTextWidth(qtyText);
    const qtyX = columnPositions[2] + (columnWidths[2] / 2) - (qtyWidth / 2);
    pdf.text(qtyText, qtyX, currentY + 6);
    
    // Unit Price column - right aligned
    const unitPriceText = item.unitPrice.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const unitPriceWidth = pdf.getTextWidth(unitPriceText);
    const unitPriceX = columnPositions[3] + columnWidths[3] - unitPriceWidth - 2;
    pdf.text(unitPriceText, unitPriceX, currentY + 6);
    
    // Total Price column - right aligned
    const totalText = item.total.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const totalWidth = pdf.getTextWidth(totalText);
    const totalX = columnPositions[4] + columnWidths[4] - totalWidth - 2;
    pdf.text(totalText, totalX, currentY + 6);
    
    currentY += PDF_CONFIG.rowHeight;
  });

  return currentY;
};

export const addInvoiceTotalsSection = (pdf: jsPDF, invoiceData: InvoiceData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  const columnWidths = [12, 80, 18, 30, 35];

  // Calculate positions for totals section
  const labelsSpan = 3; // How many columns the label spans
  let labelStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < labelsSpan; i++) {
    labelStartX += columnWidths[i];
  }

  const valueColumnIndex = 4;
  let valueStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < valueColumnIndex; i++) {
    valueStartX += columnWidths[i];
  }
  const valueColumnWidth = columnWidths[valueColumnIndex];

  // Subtotal row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  pdf.text('Subtotal', labelStartX + 2, currentY + 6);
  
  const subtotalFormatted = invoiceData.subtotal.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const subtotalText = invoiceData.currency === 'SAR' ? `${subtotalFormatted} SR` : `$${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - 2;
  pdf.text(subtotalText, subtotalX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // Discount row (if applicable)
  if (invoiceData.discount && invoiceData.discount > 0) {
    pdf.setFillColor(...COLORS.yellow);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
    
    pdf.setTextColor(...COLORS.black);
    
    const discountValue = invoiceData.discount;
    const discountLabel = invoiceData.discountType === 'percentage' 
      ? `Discount (${discountValue}%)` 
      : 'Discount';
    
    let discountAmount: number;
    if (invoiceData.discountType === 'percentage') {
      discountAmount = invoiceData.subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    
    pdf.text(discountLabel, labelStartX + 2, currentY + 6);
    
    const discountFormatted = discountAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const discountText = invoiceData.currency === 'SAR' ? `-${discountFormatted} SR` : `-$${discountFormatted}`;
    const discountWidth = pdf.getTextWidth(discountText);
    const discountX = valueStartX + valueColumnWidth - discountWidth - 2;
    pdf.text(discountText, discountX, currentY + 6);

    currentY += PDF_CONFIG.rowHeight;
  }

  // VAT 15% row
  pdf.setFillColor(...COLORS.yellow);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.black);
  pdf.text('VAT 15%', labelStartX + 2, currentY + 6);
  
  const vatFormatted = invoiceData.vat.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const vatText = invoiceData.currency === 'SAR' ? `${vatFormatted} SR` : `$${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - 2;
  pdf.text(vatText, vatX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // Total Price (final) row
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount Due', labelStartX + 2, currentY + 6);
  
  const totalFormatted = invoiceData.total.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const totalText = invoiceData.currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - 2;
  pdf.text(totalText, totalX, currentY + 6);

  return currentY + 25;
};

export const addInvoiceTermsAndBanking = (pdf: jsPDF, invoiceData: InvoiceData, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  // Payment Terms header
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Payment Terms', PDF_CONFIG.pageMargin, currentY);
  
  // Banking Details header (right side)
  pdf.text('Banking Details', pageWidth - 90, currentY);

  currentY += 10;

  // Custom Terms
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  const termLines = invoiceData.customTerms ? invoiceData.customTerms.split('\n') : ['Payment due within 30 days of invoice date'];
  
  termLines.forEach(term => {
    if (term.trim()) {
      const processedTerm = term.startsWith('•') ? term : `• ${term}`;
      currentY = addTextWithWrapping(pdf, processedTerm, PDF_CONFIG.pageMargin + 2, currentY, pageWidth - 120, PDF_CONFIG.lineHeight);
      currentY += 1;
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

export const addInvoiceFooter = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // End of invoice
  pdf.setTextColor(...COLORS.headerBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const endText = '***End Of Invoice***';
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
