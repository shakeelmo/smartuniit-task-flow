
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';
import { wrapText } from './TextWrapper';

export interface TableRowConfig {
  hasPartNumbers: boolean;
  hasUnits: boolean;
  columnWidths: number[];
  columnPositions: number[];
  tableWidth: number;
  currency: 'SAR' | 'USD';
}

export const addTableRow = (
  pdf: jsPDF,
  item: any,
  index: number,
  yPosition: number,
  config: TableRowConfig
): number => {
  const { hasPartNumbers, hasUnits, columnWidths, columnPositions, tableWidth, currency } = config;
  const baseRowHeight = 14;

  // Clean and prepare text content
  const serviceText = String(item.service || '').replace(/[^\x20-\x7E]/g, '');
  const partNumberText = String(item.partNumber || '').replace(/[^\x20-\x7E]/g, '') || '-';
  const unitText = String(item.unit || '').replace(/[^\x20-\x7E]/g, '') || '-';

  // Calculate text wrapping for description
  const maxServiceWidth = hasPartNumbers && hasUnits ? 40 : hasPartNumbers ? 50 : hasUnits ? 60 : 70;
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  const requiredRowHeight = Math.max(baseRowHeight, wrappedServiceLines.length * 6 + 6);

  // Professional alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255); // White
  } else {
    pdf.setFillColor(248, 249, 250); // Very light grey
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Add professional cell borders
  pdf.setDrawColor(220, 220, 220); // Light grey borders
  pdf.setLineWidth(0.3);
  
  // Horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Vertical borders with proper spacing
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, colIndex) => {
    if (colIndex > 0) {
      pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);
    }
    currentXPos += width;
  });
  // Right border
  pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);

  // Set text properties
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  let colIndex = 0;

  // S# column - centered with better padding
  const serialText = (index + 1).toString();
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  pdf.text(serialText, serialX, yPosition + 9);
  colIndex++;

  // Service/Description column with improved text wrapping
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedServiceLines.length * 6)) / 2 + 6);
  wrappedServiceLines.forEach((line, lineIndex) => {
    pdf.text(line, columnPositions[colIndex] + PDF_CONFIG.cellPadding + 1, serviceStartY + (lineIndex * 6));
  });
  colIndex++;

  // Part Number column (if present)
  if (hasPartNumbers) {
    const wrappedPartLines = wrapText(pdf, partNumberText, columnWidths[colIndex] - 8);
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 6)) / 2 + 6);
    wrappedPartLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + PDF_CONFIG.cellPadding + 1, partStartY + (lineIndex * 6));
    });
    colIndex++;
  }

  // Quantity column - centered
  const qtyText = item.quantity.toString();
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, yPosition + 9);
  colIndex++;

  // Unit column (if present)
  if (hasUnits) {
    const wrappedUnitLines = wrapText(pdf, unitText, columnWidths[colIndex] - 8);
    const unitStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedUnitLines.length * 6)) / 2 + 6);
    wrappedUnitLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + PDF_CONFIG.cellPadding + 1, unitStartY + (lineIndex * 6));
    });
    colIndex++;
  }

  // Unit Price column - right aligned with proper formatting
  const unitPriceFormatted = item.unitPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SR` : `$${unitPriceFormatted}`;
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - PDF_CONFIG.cellPadding - 1;
  pdf.text(unitPriceText, unitPriceX, yPosition + 9);
  colIndex++;

  // Total Price column - right aligned with consistent formatting
  const totalValue = item.quantity * item.unitPrice;
  const totalFormatted = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - PDF_CONFIG.cellPadding - 1;
  pdf.text(totalText, totalX, yPosition + 9);

  return yPosition + requiredRowHeight;
};
