
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';
import { TotalsData } from './TotalsCalculator';

const ENHANCED_ROW_HEIGHT = 12;
const CELL_PADDING = 6;

export const renderTotalsSection = (
  pdf: jsPDF,
  totalsData: TotalsData,
  yPosition: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  
  // Column configuration
  const labelColumnWidth = tableWidth * 0.65; // 65% for labels
  const valueColumnWidth = tableWidth * 0.35; // 35% for values
  const labelStartX = PDF_CONFIG.pageMargin;
  const valueStartX = PDF_CONFIG.pageMargin + labelColumnWidth;

  let currentY = yPosition;

  // Enhanced separator line
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.2);
  pdf.line(PDF_CONFIG.pageMargin, currentY, PDF_CONFIG.pageMargin + tableWidth, currentY);
  currentY += 8;

  // Render subtotal row
  currentY = renderSubtotalRow(pdf, totalsData, currentY, tableWidth, labelStartX, valueStartX, valueColumnWidth);

  // Render discount row if applicable
  if (totalsData.discount) {
    currentY = renderDiscountRow(pdf, totalsData, currentY, tableWidth, labelStartX, valueStartX, valueColumnWidth);
  }

  // Render VAT row
  currentY = renderVATRow(pdf, totalsData, currentY, tableWidth, labelStartX, valueStartX, valueColumnWidth);

  // Render total row
  currentY = renderTotalRow(pdf, totalsData, currentY, tableWidth, labelStartX, valueStartX, valueColumnWidth);

  return currentY + 20;
};

const renderSubtotalRow = (
  pdf: jsPDF,
  totalsData: TotalsData,
  yPosition: number,
  tableWidth: number,
  labelStartX: number,
  valueStartX: number,
  valueColumnWidth: number
): number => {
  // Background and border
  pdf.setFillColor(248, 250, 252);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'S');

  // Text styling
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  // Label - Use consistent currency name
  const currencyName = totalsData.currencyInfo.symbol === 'SAR' ? 'Saudi Riyals' : totalsData.currencyInfo.name;
  pdf.text(`Subtotal in ${currencyName}`, labelStartX + CELL_PADDING, yPosition + 8);

  // Value with SAR text instead of symbol
  const subtotalText = totalsData.currencyInfo.symbol === 'SAR' ? 
    `${totalsData.subtotal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR` :
    totalsData.subtotal.text;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - CELL_PADDING;
  pdf.text(subtotalText, subtotalX, yPosition + 8);

  return yPosition + ENHANCED_ROW_HEIGHT;
};

const renderDiscountRow = (
  pdf: jsPDF,
  totalsData: TotalsData,
  yPosition: number,
  tableWidth: number,
  labelStartX: number,
  valueStartX: number,
  valueColumnWidth: number
): number => {
  if (!totalsData.discount) return yPosition;

  // Background and border
  pdf.setFillColor(255, 252, 230);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'S');

  // Text styling
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  // Label
  pdf.text(totalsData.discount.label, labelStartX + CELL_PADDING, yPosition + 8);

  // Value with SAR text instead of symbol
  const discountText = totalsData.currencyInfo.symbol === 'SAR' ? 
    `-${totalsData.discount.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR` :
    totalsData.discount.text;
  const discountWidth = pdf.getTextWidth(discountText);
  const discountX = valueStartX + valueColumnWidth - discountWidth - CELL_PADDING;
  pdf.text(discountText, discountX, yPosition + 8);

  return yPosition + ENHANCED_ROW_HEIGHT;
};

const renderVATRow = (
  pdf: jsPDF,
  totalsData: TotalsData,
  yPosition: number,
  tableWidth: number,
  labelStartX: number,
  valueStartX: number,
  valueColumnWidth: number
): number => {
  // Background and border
  pdf.setFillColor(255, 250, 210);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT, 'S');

  // Text styling
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  // Label
  pdf.text('VAT 15%', labelStartX + CELL_PADDING, yPosition + 8);

  // Value with SAR text instead of symbol
  const vatText = totalsData.currencyInfo.symbol === 'SAR' ? 
    `${totalsData.vat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR` :
    totalsData.vat.text;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - CELL_PADDING;
  pdf.text(vatText, vatX, yPosition + 8);

  return yPosition + ENHANCED_ROW_HEIGHT;
};

const renderTotalRow = (
  pdf: jsPDF,
  totalsData: TotalsData,
  yPosition: number,
  tableWidth: number,
  labelStartX: number,
  valueStartX: number,
  valueColumnWidth: number
): number => {
  // Background and border with enhanced styling
  pdf.setFillColor(240, 242, 247);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT + 2, 'F');
  
  // Bold border for total row
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, ENHANCED_ROW_HEIGHT + 2, 'S');

  // Text styling
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);

  // Label - Use consistent currency name
  const currencyName = totalsData.currencyInfo.symbol === 'SAR' ? 'Saudi Riyals' : totalsData.currencyInfo.name;
  pdf.text(`Total Price in ${currencyName}`, labelStartX + CELL_PADDING, yPosition + 9);

  // Value with SAR text instead of symbol
  const totalText = totalsData.currencyInfo.symbol === 'SAR' ? 
    `${totalsData.total.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR` :
    totalsData.total.text;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - CELL_PADDING;
  pdf.text(totalText, totalX, yPosition + 9);

  return yPosition + ENHANCED_ROW_HEIGHT + 2;
};
