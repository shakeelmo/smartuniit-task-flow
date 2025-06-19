
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
  const headerRowHeight = 20;

  // Enhanced header with professional blue background
  pdf.setFillColor(83, 122, 166);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'F');

  // Draw complete header borders
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.0);
  
  // Draw outer border rectangle
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'S');
  
  // Draw vertical column separators
  let currentXPosition = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    if (index > 0) {
      pdf.setLineWidth(0.8);
      pdf.setDrawColor(...COLORS.white);
      pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + headerRowHeight);
    }
    currentXPosition += width;
  });

  // Set header text properties
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  // Define header text - ensuring S# is clearly labeled
  let headers: string[];
  const currencyText = currency === 'SAR' ? 'SAR' : 'USD';
  
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Description', 'Part Number', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total (${currencyText})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Description', 'Part Number', 'Qty', `Unit Price (${currencyText})`, `Total (${currencyText})`];
  } else if (hasUnits) {
    headers = ['S#', 'Description', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total (${currencyText})`];
  } else {
    headers = ['S#', 'Description', 'Qty', `Unit Price (${currencyText})`, `Total (${currencyText})`];
  }

  // Render header text with proper alignment
  headers.forEach((header, index) => {
    const cellPadding = 3;
    const textY = yPosition + (headerRowHeight / 2) + 2;
    
    // Center align S# and Qty columns
    if (header === 'S#' || header === 'Qty') {
      const textWidth = pdf.getTextWidth(header);
      const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
      pdf.text(header, centeredX, textY);
    }
    // Right align price columns
    else if (header.includes('Price') || header.includes('Total')) {
      const textWidth = pdf.getTextWidth(header);
      const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - cellPadding;
      pdf.text(header, rightAlignedX, textY);
    }
    // Left align other columns
    else {
      pdf.text(header, columnPositions[index] + cellPadding, textY);
    }
  });

  return yPosition + headerRowHeight;
};
