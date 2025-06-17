
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
  const enhancedRowHeight = 12;
  const totalsSectionHeight = 70;
  
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

  // Simplified and consistent totals section positioning
  const labelColumnWidth = tableWidth * 0.65; // 65% for labels
  const valueColumnWidth = tableWidth * 0.35; // 35% for values
  const labelStartX = PDF_CONFIG.pageMargin;
  const valueStartX = PDF_CONFIG.pageMargin + labelColumnWidth;

  // Enhanced separator line with professional styling
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.2);
  pdf.line(PDF_CONFIG.pageMargin, currentY, PDF_CONFIG.pageMargin + tableWidth, currentY);
  currentY += 8;

  const cellPadding = 6;

  // Subtotal row
  pdf.setFillColor(248, 250, 252);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  pdf.text(`Subtotal in ${currencyInfo.name}`, labelStartX + cellPadding, currentY + 8);

  const subtotalFormatted = quotationData.subtotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const subtotalText = quotationData.currency === 'SAR' ? `${subtotalFormatted} SR` : `$${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - cellPadding;
  pdf.text(subtotalText, subtotalX, currentY + 8);

  currentY += enhancedRowHeight;

  // Discount row (if applicable)
  if (quotationData.discount && quotationData.discount > 0) {
    pdf.setFillColor(255, 252, 230);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.medium);

    let discountLabel = 'Discount';
    if (quotationData.discountType === 'percentage') {
      if (typeof quotationData.discountPercent === 'number') {
        discountLabel = `Discount (${quotationData.discountPercent}%)`;
      }
    }

    pdf.text(discountLabel, labelStartX + cellPadding, currentY + 8);

    const discountFormatted = quotationData.discount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const discountText = quotationData.currency === 'SAR'
      ? `-${discountFormatted} SR`
      : `-$${discountFormatted}`;
    const discountWidth = pdf.getTextWidth(discountText);
    const discountX = valueStartX + valueColumnWidth - discountWidth - cellPadding;
    pdf.text(discountText, discountX, currentY + 8);

    currentY += enhancedRowHeight;
  }

  // VAT row
  pdf.setFillColor(255, 250, 210);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('VAT 15%', labelStartX + cellPadding, currentY + 8);

  const vatFormatted = quotationData.vat.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const vatText = quotationData.currency === 'SAR' ? `${vatFormatted} SR` : `$${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - cellPadding;
  pdf.text(vatText, vatX, currentY + 8);

  currentY += enhancedRowHeight;

  // Total row with enhanced styling
  pdf.setFillColor(240, 242, 247);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight + 2, 'F');
  
  // Bold border for total row
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, enhancedRowHeight + 2, 'S');

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX + cellPadding, currentY + 9);

  const totalFormatted = quotationData.total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = quotationData.currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - cellPadding;
  pdf.text(totalText, totalX, currentY + 9);

  return currentY + 20;
};

const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

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
