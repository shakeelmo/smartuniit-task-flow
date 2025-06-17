
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
  const headerRowHeight = 16;

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
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);

  // Enhanced header text with better formatting - always include Total Price column
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
    const cellPadding = 6;
    
    // Center align S# and Qty columns with improved spacing
    if (header === 'S#' || header === 'Qty') {
      const textWidth = pdf.getTextWidth(header);
      const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
      pdf.text(header, centeredX, yPosition + 11);
    }
    // Right align price columns with consistent formatting
    else if (header.includes('Price')) {
      const textWidth = pdf.getTextWidth(header);
      const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - cellPadding;
      pdf.text(header, rightAlignedX, yPosition + 11);
    }
    // Left align other columns with proper padding
    else {
      pdf.text(header, columnPositions[index] + cellPadding, yPosition + 11);
    }
  });

  return yPosition + headerRowHeight;
};
