
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
  const headerHeight = 18; // Increased height for better spacing

  // Enhanced header background with gradient effect simulation
  pdf.setFillColor(65, 105, 180); // Professional blue
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerHeight, 'F');

  // Add subtle border for definition
  pdf.setDrawColor(45, 85, 160);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerHeight);

  // Header text styling - reduced font size to prevent overlap
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8); // Reduced font size to prevent overlapping

  let colIndex = 0;
  const cellPadding = 1; // Reduced padding for better fit
  const textY = yPosition + headerHeight / 2 + 2; // Centered vertically

  // Serial Number header - centered
  const serialHeader = '#';
  const serialWidth = pdf.getTextWidth(serialHeader);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  pdf.text(serialHeader, serialX, textY);
  colIndex++;

  // Description header - left aligned with padding, truncated if needed
  const descHeader = 'Description';
  const maxDescWidth = columnWidths[colIndex] - (cellPadding * 2);
  let truncatedDescHeader = descHeader;
  if (pdf.getTextWidth(descHeader) > maxDescWidth) {
    truncatedDescHeader = 'Desc.';
  }
  pdf.text(truncatedDescHeader, columnPositions[colIndex] + cellPadding, textY);
  colIndex++;

  // Part Number header (if present) - centered, abbreviated if needed
  if (hasPartNumbers) {
    const partHeader = 'Part No.';
    const maxPartWidth = columnWidths[colIndex] - (cellPadding * 2);
    let truncatedPartHeader = partHeader;
    if (pdf.getTextWidth(partHeader) > maxPartWidth) {
      truncatedPartHeader = 'Part';
    }
    const partWidth = pdf.getTextWidth(truncatedPartHeader);
    const partX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (partWidth / 2);
    pdf.text(truncatedPartHeader, partX, textY);
    colIndex++;
  }

  // Quantity header - centered, abbreviated
  const qtyHeader = 'Qty';
  const qtyWidth = pdf.getTextWidth(qtyHeader);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyHeader, qtyX, textY);
  colIndex++;

  // Unit header (if present) - centered
  if (hasUnits) {
    const unitHeader = 'Unit';
    const maxUnitHeaderWidth = columnWidths[colIndex] - (cellPadding * 2);
    let truncatedUnitHeader = unitHeader;
    if (pdf.getTextWidth(unitHeader) > maxUnitHeaderWidth) {
      truncatedUnitHeader = 'U';
    }
    const unitWidth = pdf.getTextWidth(truncatedUnitHeader);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    pdf.text(truncatedUnitHeader, unitX, textY);
    colIndex++;
  }

  // Unit Price header - right aligned, abbreviated for currency
  const unitPriceHeader = currency === 'SAR' ? 'Price (SAR)' : 'Price ($)';
  const maxUnitPriceWidth = columnWidths[colIndex] - (cellPadding * 2);
  let truncatedUnitPriceHeader = unitPriceHeader;
  if (pdf.getTextWidth(unitPriceHeader) > maxUnitPriceWidth) {
    truncatedUnitPriceHeader = currency === 'SAR' ? 'Price' : 'Price';
  }
  const unitPriceWidth = pdf.getTextWidth(truncatedUnitPriceHeader);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  pdf.text(truncatedUnitPriceHeader, unitPriceX, textY);
  colIndex++;

  // Total header - right aligned, abbreviated
  const totalHeader = currency === 'SAR' ? 'Total (SAR)' : 'Total ($)';
  const maxTotalWidth = columnWidths[colIndex] - (cellPadding * 2);
  let truncatedTotalHeader = totalHeader;
  if (pdf.getTextWidth(totalHeader) > maxTotalWidth) {
    truncatedTotalHeader = 'Total';
  }
  const totalWidth = pdf.getTextWidth(truncatedTotalHeader);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  pdf.text(truncatedTotalHeader, totalX, textY);

  // Add vertical separators for column definition - thinner lines
  pdf.setDrawColor(200, 200, 200); // Lighter color
  pdf.setLineWidth(0.3); // Thinner lines
  
  columnPositions.forEach((position, index) => {
    if (index > 0 && index < columnPositions.length) { // Skip first and last
      pdf.line(position, yPosition, position, yPosition + headerHeight);
    }
  });

  return yPosition + headerHeight;
};
