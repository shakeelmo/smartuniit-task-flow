
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { getCurrencyInfo } from '../helpers';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 40; // Space reserved for footer

export const addTotalsSection = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const currencyInfo = getCurrencyInfo(quotationData.currency);
  let currentY = yPosition;

  // Calculate space needed for totals section
  const enhancedRowHeight = 12; // Match table row height
  const totalsSectionHeight = 70; // Approximate height needed for all totals rows
  
  // Check if we need a new page for totals section
  if (currentY + totalsSectionHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    currentY = addPageHeader(pdf, quotationData);
  }

  // Determine column configuration based on data
  const allLineItems = quotationData.sections 
    ? quotationData.sections.flatMap(section => section.lineItems)
    : quotationData.lineItems;
    
  const hasPartNumbers = allLineItems.some(item => item.partNumber && item.partNumber.trim());
  const hasUnits = allLineItems.some(item => item.unit && item.unit.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;

  // Adjust column widths based on what columns are shown
  const columnWidths = hasPartNumbers && hasUnits 
    ? [12, 45, 18, 15, 15, 35, 35]
    : hasPartNumbers 
    ? [12, 55, 25, 20, 40, 45]
    : hasUnits
    ? [12, 65, 18, 15, 40, 45]
    : [12, 75, 25, 40, 45];

  const labelsSpan = hasPartNumbers && hasUnits ? 5 : hasPartNumbers ? 4 : hasUnits ? 4 : 3;
  let labelStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < labelsSpan; i++) {
    labelStartX += columnWidths[i];
  }

  const valueColumnIndex = hasPartNumbers && hasUnits ? 6 : hasPartNumbers ? 5 : hasUnits ? 5 : 4;
  let valueStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < valueColumnIndex; i++) {
    valueStartX += columnWidths[i];
  }
  const valueColumnWidth = columnWidths[valueColumnIndex];

  // Add a separator line before totals with enhanced styling
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1);
  pdf.line(PDF_CONFIG.pageMargin, currentY, pageWidth - PDF_CONFIG.pageMargin, currentY);
  currentY += 8;

  // Enhanced subtotal row with better styling
  pdf.setFillColor(...COLORS.headerGray);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'FD');

  // Add border
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  pdf.text(`Subtotal in ${currencyInfo.name}`, labelStartX + PDF_CONFIG.cellPadding, currentY + 8);

  const subtotalFormatted = quotationData.subtotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const subtotalText = quotationData.currency === 'SAR' ? `${subtotalFormatted} SR` : `$${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - PDF_CONFIG.cellPadding;
  pdf.text(subtotalText, subtotalX, currentY + 8);

  currentY += enhancedRowHeight;

  // Enhanced discount row (if applicable)
  if (quotationData.discount && quotationData.discount > 0) {
    pdf.setFillColor(255, 252, 230); // Light yellow background
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'FD');

    // Add border
    pdf.setDrawColor(...COLORS.borderGray);
    pdf.setLineWidth(0.3);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');

    let discountLabel = 'Discount';
    if (quotationData.discountType === 'percentage') {
      if (typeof quotationData.discountPercent === 'number') {
        discountLabel = `Discount (${quotationData.discountPercent}%)`;
      } else {
        discountLabel = 'Discount (%)';
      }
    }

    pdf.text(discountLabel, labelStartX + PDF_CONFIG.cellPadding, currentY + 8);

    const discountFormatted = quotationData.discount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const discountText = quotationData.currency === 'SAR'
      ? `-${discountFormatted} SR`
      : `-$${discountFormatted}`;
    const discountWidth = pdf.getTextWidth(discountText);
    const discountX = valueStartX + valueColumnWidth - discountWidth - PDF_CONFIG.cellPadding;
    pdf.text(discountText, discountX, currentY + 8);

    currentY += enhancedRowHeight;
  }

  // Enhanced VAT row
  pdf.setFillColor(255, 252, 230); // Light yellow background
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'FD');
  
  // Add border
  pdf.setDrawColor(...COLORS.borderGray);
  pdf.setLineWidth(0.3);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.text('VAT 15%', labelStartX + PDF_CONFIG.cellPadding, currentY + 8);

  const vatFormatted = quotationData.vat.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const vatText = quotationData.currency === 'SAR' ? `${vatFormatted} SR` : `$${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - PDF_CONFIG.cellPadding;
  pdf.text(vatText, vatX, currentY + 8);

  currentY += enhancedRowHeight;

  // Enhanced total row
  pdf.setFillColor(...COLORS.headerGray);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'FD');
  
  // Add bold border
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX + PDF_CONFIG.cellPadding, currentY + 8);

  const totalFormatted = quotationData.total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = quotationData.currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - PDF_CONFIG.cellPadding;
  pdf.text(totalText, totalX, currentY + 8);

  return currentY + 25;
};

const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Add basic header info on continuation pages
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Quotation (Continued)', PDF_CONFIG.pageMargin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(`Quote: ${quotationData.number}`, pageWidth - 80, yPosition);
  
  yPosition += 10;
  pdf.text(`Customer: ${quotationData.customer.companyName}`, PDF_CONFIG.pageMargin, yPosition);
  
  return yPosition + 15;
};
