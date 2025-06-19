
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';

export interface TableHeaderConfig {
  hasPartNumbers: boolean;
  hasUnits: boolean;
  currency: 'SAR' | 'USD';
  columnWidths: number[];
  columnPositions: number[];
  tableWidth: number;
}

export const addTableHeader = (
  pdf: jsPDF,
  yPosition: number,
  config: TableHeaderConfig
): number => {
  const { hasPartNumbers, hasUnits, currency, columnWidths, columnPositions, tableWidth } = config;
  const headerHeight = 16; // Increased for better visual presence

  // Enhanced header background with gradient effect simulation
  pdf.setFillColor(65, 105, 180); // Professional blue
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerHeight, 'F');

  // Add subtle border for definition
  pdf.setDrawColor(45, 85, 160);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerHeight);

  // Header text styling - enhanced for professionalism
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10); // Slightly larger for better readability

  let colIndex = 0;
  const cellPadding = 2;
  const textY = yPosition + headerHeight / 2 + 2; // Centered vertically

  // Serial Number header - centered
  const serialHeader = '#';
  const serialWidth = pdf.getTextWidth(serialHeader);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  pdf.text(serialHeader, serialX, textY);
  colIndex++;

  // Description header - left aligned with padding
  pdf.text('Description / الوصف', columnPositions[colIndex] + cellPadding, textY);
  colIndex++;

  // Part Number header (if present) - centered
  if (hasPartNumbers) {
    const partHeader = 'Part No.';
    const partWidth = pdf.getTextWidth(partHeader);
    const partX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (partWidth / 2);
    pdf.text(partHeader, partX, textY);
    colIndex++;
  }

  // Quantity header - centered
  const qtyHeader = 'Qty / الكمية';
  const qtyWidth = pdf.getTextWidth(qtyHeader);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyHeader, qtyX, textY);
  colIndex++;

  // Unit header (if present) - centered
  if (hasUnits) {
    const unitHeader = 'Unit';
    const unitWidth = pdf.getTextWidth(unitHeader);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    pdf.text(unitHeader, unitX, textY);
    colIndex++;
  }

  // Unit Price header - right aligned for currency alignment
  const unitPriceHeader = currency === 'SAR' ? 'Unit Price (SAR)' : 'Unit Price ($)';
  const unitPriceWidth = pdf.getTextWidth(unitPriceHeader);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  pdf.text(unitPriceHeader, unitPriceX, textY);
  colIndex++;

  // Total header - right aligned for emphasis
  const totalHeader = currency === 'SAR' ? 'Total (SAR) / المجموع' : 'Total ($)';
  const totalWidth = pdf.getTextWidth(totalHeader);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  pdf.text(totalHeader, totalX, textY);

  // Add vertical separators for column definition
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  
  columnPositions.forEach((position, index) => {
    if (index > 0) { // Skip first position (table start)
      pdf.line(position, yPosition, position, yPosition + headerHeight);
    }
  });

  return yPosition + headerHeight;
};
