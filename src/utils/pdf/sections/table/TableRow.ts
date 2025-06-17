
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
  const baseRowHeight = 16; // Increased for better spacing

  // Clean and prepare text content
  const serviceText = String(item.service || '').replace(/[^\x20-\x7E]/g, '');
  const partNumberText = String(item.partNumber || '').replace(/[^\x20-\x7E]/g, '') || '-';
  const unitText = String(item.unit || '').replace(/[^\x20-\x7E]/g, '') || '-';

  // Calculate text wrapping for description with improved width calculation
  const descriptionColumnIndex = 1;
  const maxServiceWidth = columnWidths[descriptionColumnIndex] - 12; // More padding for text
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  const requiredRowHeight = Math.max(baseRowHeight, wrappedServiceLines.length * 6 + 8);

  // Enhanced alternating row colors for better readability
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255); // White
  } else {
    pdf.setFillColor(248, 250, 252); // Very light blue-gray
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Enhanced cell borders with consistent styling
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  
  // Horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Vertical borders with proper alignment
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, colIndex) => {
    if (colIndex > 0) {
      pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);
    }
    currentXPos += width;
  });
  // Right border
  pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);

  // Set enhanced text properties
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  let colIndex = 0;
  const cellPadding = 6; // Increased padding

  // S# column - centered with improved styling
  const serialText = (index + 1).toString();
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  pdf.text(serialText, serialX, yPosition + Math.max(11, (requiredRowHeight / 2) + 2));
  colIndex++;

  // Service/Description column with enhanced text wrapping
  const serviceStartY = yPosition + Math.max(11, (requiredRowHeight - (wrappedServiceLines.length * 6)) / 2 + 6);
  wrappedServiceLines.forEach((line, lineIndex) => {
    pdf.text(line, columnPositions[colIndex] + cellPadding, serviceStartY + (lineIndex * 6));
  });
  colIndex++;

  // Part Number column (if present) with consistent formatting
  if (hasPartNumbers) {
    const maxPartWidth = columnWidths[colIndex] - 12;
    const wrappedPartLines = wrapText(pdf, partNumberText, maxPartWidth);
    const partStartY = yPosition + Math.max(11, (requiredRowHeight - (wrappedPartLines.length * 6)) / 2 + 6);
    wrappedPartLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + cellPadding, partStartY + (lineIndex * 6));
    });
    colIndex++;
  }

  // Quantity column - centered with proper alignment
  const qtyText = item.quantity.toString();
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, yPosition + Math.max(11, (requiredRowHeight / 2) + 2));
  colIndex++;

  // Unit column (if present) with enhanced formatting
  if (hasUnits) {
    const maxUnitWidth = columnWidths[colIndex] - 12;
    const wrappedUnitLines = wrapText(pdf, unitText, maxUnitWidth);
    const unitStartY = yPosition + Math.max(11, (requiredRowHeight - (wrappedUnitLines.length * 6)) / 2 + 6);
    wrappedUnitLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + cellPadding, unitStartY + (lineIndex * 6));
    });
    colIndex++;
  }

  // Unit Price column - right aligned with enhanced formatting
  const unitPriceFormatted = item.unitPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SR` : `$${unitPriceFormatted}`;
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  pdf.text(unitPriceText, unitPriceX, yPosition + Math.max(11, (requiredRowHeight / 2) + 2));
  colIndex++;

  // Total Price column - right aligned with consistent spacing
  const totalValue = item.quantity * item.unitPrice;
  const totalFormatted = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  pdf.text(totalText, totalX, yPosition + Math.max(11, (requiredRowHeight / 2) + 2));

  return yPosition + requiredRowHeight;
};
