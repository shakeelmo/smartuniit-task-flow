
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
  const headerRowHeight = 20; // Increased height to accommodate wrapped text

  // Enhanced header with professional blue background
  pdf.setFillColor(83, 122, 166); // Medium blue background
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'F');

  // Add strong border for header
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'S');
  
  // Add vertical separators for columns with enhanced spacing
  let currentXPos = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    if (index > 0) {
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(currentXPos, yPosition, currentXPos, yPosition + headerRowHeight);
    }
    currentXPos += width;
  });

  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal); // Slightly smaller font for better fit

  // Enhanced header text with text wrapping support
  let headers: string[];
  const currencyText = currency === 'SAR' ? 'SAR' : 'USD';
  
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Item Description', 'Part Number', 'Qty', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else if (hasUnits) {
    headers = ['S#', 'Item Description', 'Qty', 'Unit', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  } else {
    headers = ['S#', 'Item Description', 'Qty', `Unit Price (${currencyText})`, `Total Price (${currencyText})`];
  }

  headers.forEach((header, index) => {
    const cellPadding = 4;
    const maxWidth = columnWidths[index] - (cellPadding * 2);
    
    // Wrap text for headers to prevent overlap
    const wrappedLines = wrapText(pdf, header, maxWidth, PDF_CONFIG.fontSize.normal);
    const startY = yPosition + 8 + ((headerRowHeight - 8 - (wrappedLines.length * 4)) / 2);
    
    // Center align S# and Qty columns
    if (header === 'S#' || header === 'Qty') {
      wrappedLines.forEach((line, lineIndex) => {
        const textWidth = pdf.getTextWidth(line);
        const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
        pdf.text(line, centeredX, startY + (lineIndex * 4));
      });
    }
    // Right align price columns
    else if (header.includes('Price')) {
      wrappedLines.forEach((line, lineIndex) => {
        const textWidth = pdf.getTextWidth(line);
        const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - cellPadding;
        pdf.text(line, rightAlignedX, startY + (lineIndex * 4));
      });
    }
    // Left align other columns
    else {
      wrappedLines.forEach((line, lineIndex) => {
        pdf.text(line, columnPositions[index] + cellPadding, startY + (lineIndex * 4));
      });
    }
  });

  return yPosition + headerRowHeight;
};
