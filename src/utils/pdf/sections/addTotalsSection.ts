
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

  // Enhanced spacing and section height calculations
  const enhancedRowHeight = 14;
  const totalsSectionHeight = 80;
  
  // Check if we need a new page for totals section
  if (currentY + totalsSectionHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    currentY = addPageHeader(pdf, quotationData);
  }

  // Determine column configuration with improved layout
  const allLineItems = quotationData.sections 
    ? quotationData.sections.flatMap(section => section.lineItems)
    : quotationData.lineItems;
    
  const hasPartNumbers = allLineItems.some(item => item.partNumber && item.partNumber.trim());
  const hasUnits = allLineItems.some(item => item.unit && item.unit.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;

  // Enhanced column width calculations for better alignment
  const columnWidths = hasPartNumbers && hasUnits 
    ? [18, 55, 25, 18, 22, 45, 50]
    : hasPartNumbers 
    ? [18, 65, 28, 22, 48, 52]
    : hasUnits
    ? [18, 75, 18, 22, 48, 52]
    : [18, 85, 25, 48, 52];

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

  // Enhanced separator line with professional styling
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.2);
  pdf.line(PDF_CONFIG.pageMargin, currentY, pageWidth - PDF_CONFIG.pageMargin, currentY);
  currentY += 10;

  // Subtotal row with enhanced styling and spacing
  pdf.setFillColor(245, 247, 250); // Light blue-gray background
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');

  // Enhanced border styling
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  const cellPadding = 8; // Increased padding
  pdf.text(`Subtotal in ${currencyInfo.name}`, labelStartX + cellPadding, currentY + 9);

  const subtotalFormatted = quotationData.subtotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const subtotalText = quotationData.currency === 'SAR' ? `${subtotalFormatted} SR` : `$${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - cellPadding;
  pdf.text(subtotalText, subtotalX, currentY + 9);

  currentY += enhancedRowHeight + 2; // Added spacing between rows

  // Enhanced discount row with improved styling
  if (quotationData.discount && quotationData.discount > 0) {
    pdf.setFillColor(255, 252, 230); // Light yellow background
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');

    pdf.setDrawColor(220, 200, 150);
    pdf.setLineWidth(0.4);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.medium);

    let discountLabel = 'Discount';
    if (quotationData.discountType === 'percentage') {
      if (typeof quotationData.discountPercent === 'number') {
        discountLabel = `Discount (${quotationData.discountPercent}%)`;
      } else {
        discountLabel = 'Discount (%)';
      }
    }

    pdf.text(discountLabel, labelStartX + cellPadding, currentY + 9);

    const discountFormatted = quotationData.discount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const discountText = quotationData.currency === 'SAR'
      ? `-${discountFormatted} SR`
      : `-$${discountFormatted}`;
    const discountWidth = pdf.getTextWidth(discountText);
    const discountX = valueStartX + valueColumnWidth - discountWidth - cellPadding;
    pdf.text(discountText, discountX, currentY + 9);

    currentY += enhancedRowHeight + 2;
  }

  // Enhanced VAT row with professional styling
  pdf.setFillColor(255, 250, 210); // Light yellow background
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');
  
  pdf.setDrawColor(220, 200, 150);
  pdf.setLineWidth(0.4);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('VAT 15%', labelStartX + cellPadding, currentY + 9);

  const vatFormatted = quotationData.vat.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const vatText = quotationData.currency === 'SAR' ? `${vatFormatted} SR` : `$${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - cellPadding;
  pdf.text(vatText, vatX, currentY + 9);

  currentY += enhancedRowHeight + 2;

  // Enhanced total row with premium styling
  pdf.setFillColor(240, 242, 247); // Light gray background
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');
  
  // Bold border for total row
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX + cellPadding, currentY + 10);

  const totalFormatted = quotationData.total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = quotationData.currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - cellPadding;
  pdf.text(totalText, totalX, currentY + 10);

  return currentY + 25;
};

const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Enhanced header for continuation pages
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Quotation (Continued)', PDF_CONFIG.pageMargin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(`Quote: ${quotationData.number}`, pageWidth - 80, yPosition);
  
  yPosition += 10;
  const customerName = quotationData.customer.companyName || 'Unknown Customer';
  pdf.text(`Customer: ${customerName}`, PDF_CONFIG.pageMargin, yPosition);
  
  return yPosition + 15;
};
