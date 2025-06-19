
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

// Helper function to truncate text to fit in column width
const truncateHeaderText = (pdf: jsPDF, text: string, maxWidth: number): string => {
  if (!text || maxWidth <= 0) return '';
  
  const textWidth = pdf.getTextWidth(text);
  if (textWidth <= maxWidth) {
    return text;
  }
  
  // If text is too long, truncate intelligently
  let truncated = text;
  
  // For price columns, try shortening the currency part first
  if (text.includes('Unit Price')) {
    const shortVersion = text.replace('Unit Price', 'Price');
    if (pdf.getTextWidth(shortVersion) <= maxWidth) {
      return shortVersion;
    }
  }
  
  if (text.includes('Total')) {
    const shortVersion = text.replace('Total', 'Total');
    if (pdf.getTextWidth(shortVersion) <= maxWidth) {
      return shortVersion;
    }
  }
  
  // General truncation with ellipsis
  while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated.length < text.length ? truncated + '...' : truncated;
};

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

  // Define header text with proper structure
  let headers: string[];
  const currencyText = currency === 'SAR' ? 'SAR' : 'USD';
  
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Description', 'Part No.', 'Qty', 'Unit', `Price (${currencyText})`, `Total (${currencyText})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Description', 'Part No.', 'Qty', `Price (${currencyText})`, `Total (${currencyText})`];
  } else if (hasUnits) {
    headers = ['S#', 'Description', 'Qty', 'Unit', `Price (${currencyText})`, `Total (${currencyText})`];
  } else {
    headers = ['S#', 'Description', 'Qty', `Price (${currencyText})`, `Total (${currencyText})`];
  }

  // Render header text with proper alignment and truncation
  headers.forEach((header, index) => {
    const cellPadding = 2;
    const maxTextWidth = columnWidths[index] - (cellPadding * 2);
    const truncatedHeader = truncateHeaderText(pdf, header, maxTextWidth);
    const textY = yPosition + (headerRowHeight / 2) + 2;
    
    // Center align S# and Qty columns
    if (header === 'S#' || header === 'Qty') {
      const textWidth = pdf.getTextWidth(truncatedHeader);
      const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
      pdf.text(truncatedHeader, centeredX, textY);
    }
    // Right align price columns
    else if (header.includes('Price') || header.includes('Total')) {
      const textWidth = pdf.getTextWidth(truncatedHeader);
      const rightAlignedX = columnPositions[index] + columnWidths[index] - textWidth - cellPadding;
      pdf.text(truncatedHeader, rightAlignedX, textY);
    }
    // Left align other columns
    else {
      pdf.text(truncatedHeader, columnPositions[index] + cellPadding, textY);
    }
  });

  return yPosition + headerRowHeight;
};
