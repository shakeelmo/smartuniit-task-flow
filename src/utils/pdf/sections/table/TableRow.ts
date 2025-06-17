
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
  const enhancedRowHeight = 12;

  // Calculate required height for this row based on text wrapping
  const serviceText = String(item.service || '').replace(/[^\x20-\x7E]/g, '');
  const maxServiceWidth = hasPartNumbers && hasUnits ? 40 : hasPartNumbers ? 50 : hasUnits ? 60 : 70;
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  const requiredRowHeight = Math.max(enhancedRowHeight, wrappedServiceLines.length * 5 + 4);

  // Enhanced alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(248, 250, 252); // Very light blue-gray
  } else {
    pdf.setFillColor(255, 255, 255); // White
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Add cell borders
  pdf.setDrawColor(...COLORS.borderGray);
  pdf.setLineWidth(0.3);
  
  // Horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Vertical borders
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);
    currentXPos += width;
  });
  pdf.line(currentXPos, yPosition, currentXPos, yPosition + requiredRowHeight);

  // Reset text properties
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  // S# column - centered with padding
  const serialText = (index + 1).toString();
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[0] + (columnWidths[0] / 2) - (serialWidth / 2);
  pdf.text(serialText, serialX, yPosition + 8);

  // Service/Description column with proper text wrapping
  wrappedServiceLines.forEach((line, lineIndex) => {
    pdf.text(line, columnPositions[1] + PDF_CONFIG.cellPadding, yPosition + 8 + (lineIndex * 5));
  });

  let colIndex = 2;
  
  // Part Number column (if present)
  if (hasPartNumbers) {
    const partText = item.partNumber || '-';
    const wrappedPartLines = wrapText(pdf, partText, columnWidths[colIndex] - 6);
    wrappedPartLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + PDF_CONFIG.cellPadding, yPosition + 8 + (lineIndex * 5));
    });
    colIndex++;
  }

  // Quantity column - centered
  const qtyText = item.quantity.toString();
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, yPosition + 8);
  colIndex++;

  // Unit column (if present)
  if (hasUnits) {
    const unitText = item.unit || '-';
    const wrappedUnitLines = wrapText(pdf, unitText, columnWidths[colIndex] - 6);
    wrappedUnitLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + PDF_CONFIG.cellPadding, yPosition + 8 + (lineIndex * 5));
    });
    colIndex++;
  }

  // Unit Price column - right aligned with proper currency formatting
  const unitPriceText = item.unitPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const formattedUnitPrice = currency === 'SAR' ? `${unitPriceText} SR` : `$${unitPriceText}`;
  const unitPriceWidth = pdf.getTextWidth(formattedUnitPrice);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - PDF_CONFIG.cellPadding;
  pdf.text(formattedUnitPrice, unitPriceX, yPosition + 8);
  colIndex++;

  // Total Price column - right aligned with proper currency formatting
  const totalValue = item.quantity * item.unitPrice;
  const totalText = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const formattedTotal = currency === 'SAR' ? `${totalText} SR` : `$${totalText}`;
  const totalWidth = pdf.getTextWidth(formattedTotal);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - PDF_CONFIG.cellPadding;
  pdf.text(formattedTotal, totalX, yPosition + 8);

  return yPosition + requiredRowHeight;
};
