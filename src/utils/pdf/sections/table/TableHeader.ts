
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
  const enhancedRowHeight = 12;

  // Enhanced header with better styling and borders
  pdf.setFillColor(...COLORS.headerGray);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, enhancedRowHeight, 'FD');

  // Add border lines for header
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.5);
  
  // Top border
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  // Bottom border
  pdf.line(PDF_CONFIG.pageMargin, yPosition + enhancedRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + enhancedRowHeight);
  
  // Vertical borders
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    pdf.line(currentXPos, yPosition, currentXPos, yPosition + enhancedRowHeight);
    currentXPos += width;
  });
  // Right border
  pdf.line(currentXPos, yPosition, currentXPos, yPosition + enhancedRowHeight);

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  // Fixed headers with proper text encoding
  let headers: string[];
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', 'Unit', `Unit Price\n(${currency})`, `Total Price\n(${currency})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', `Unit Price\n(${currency})`, `Total Price\n(${currency})`];
  } else if (hasUnits) {
    headers = ['S#', 'Item Description', 'Qty', 'Unit', `Unit Price\n(${currency})`, `Total Price\n(${currency})`];
  } else {
    headers = ['S#', 'Item Description', 'Quantity', `Unit Price\n(${currency})`, `Total Price\n(${currency})`];
  }

  headers.forEach((header, index) => {
    const x = columnPositions[index] + PDF_CONFIG.cellPadding;
    if (header.includes('\n')) {
      const lines = header.split('\n');
      pdf.text(lines[0], x, yPosition + 5);
      pdf.text(lines[1], x, yPosition + 9);
    } else {
      pdf.text(header, x, yPosition + 8);
    }
  });

  return yPosition + enhancedRowHeight;
};
