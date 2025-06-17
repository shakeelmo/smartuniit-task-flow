
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
  const headerRowHeight = 14;

  // Enhanced header with professional styling
  pdf.setFillColor(240, 240, 240); // Light grey background
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'F');

  // Add strong border for header
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'S');
  
  // Add vertical separators for columns
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    if (index > 0) { // Skip first border as it's part of the outer rectangle
      pdf.line(currentXPos, yPosition, currentXPos, yPosition + headerRowHeight);
    }
    currentXPos += width;
  });

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  // Clean header text to prevent encoding issues
  let headers: string[];
  const currencyText = currency === 'SAR' ? 'SAR' : 'USD';
  
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasUnits) {
    headers = ['S#', 'Item Description', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else {
    headers = ['S#', 'Item Description', 'Quantity', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  }

  headers.forEach((header, index) => {
    const x = columnPositions[index] + PDF_CONFIG.cellPadding + 1;
    
    // Center align S# and Qty columns
    if (header === 'S#' || header === 'Qty' || header === 'Quantity') {
      const textWidth = pdf.getTextWidth(header);
      const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
      pdf.text(header, centeredX, yPosition + 9);
    }
    // Right align price columns
    else if (header.includes('Price')) {
      const textWidth = pdf.getTextWidth(header);
      const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - PDF_CONFIG.cellPadding - 1;
      pdf.text(header, rightAlignedX, yPosition + 9);
    }
    // Left align other columns
    else {
      pdf.text(header, x, yPosition + 9);
    }
  });

  return yPosition + headerRowHeight;
};
