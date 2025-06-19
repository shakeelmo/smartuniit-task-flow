
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';
import { wrapText } from './TextWrapper';

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
  pdf.setFillColor(83, 122, 166); // Medium blue background
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'F');

  // CONSISTENT BORDER SYSTEM - Draw complete header borders
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.0);
  
  // Draw outer border rectangle
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'S');
  
  // Draw vertical column separators with consistent styling
  let currentXPosition = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    if (index > 0) { // Skip the first column (no left border needed)
      pdf.setLineWidth(0.8);
      pdf.setDrawColor(...COLORS.white); // White separators for visibility on blue background
      pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + headerRowHeight);
    }
    currentXPosition += width;
  });

  // Set header text properties
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  // Define header text based on configuration with PROPER currency symbols
  let headers: string[];
  const currencyText = currency === 'SAR' ? '﷼' : 'USD'; // Use proper Saudi Riyal symbol
  
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasUnits) {
    headers = ['S#', 'Item Description', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else {
    headers = ['S#', 'Item Description', 'Qty', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  }

  // Render header text with proper alignment and visibility
  headers.forEach((header, index) => {
    const cellPadding = 3;
    const maxWidth = columnWidths[index] - (cellPadding * 2);
    
    // Use single line for headers to ensure visibility
    const headerText = header.replace(/\n/g, ' '); // Remove line breaks for better display
    
    // Calculate text position for proper centering
    const textY = yPosition + (headerRowHeight / 2) + 2; // Center vertically
    
    // Center align S# and Qty columns
    if (header === 'S#' || header === 'Qty') {
      const textWidth = pdf.getTextWidth(headerText);
      const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
      pdf.text(headerText, centeredX, textY);
    }
    // Right align price columns
    else if (header.includes('Price')) {
      const textWidth = pdf.getTextWidth(headerText);
      const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - cellPadding;
      pdf.text(headerText, rightAlignedX, textY);
    }
    // Left align other columns
    else {
      pdf.text(headerText, columnPositions[index] + cellPadding, textY);
    }
  });

  return yPosition + headerRowHeight;
};
