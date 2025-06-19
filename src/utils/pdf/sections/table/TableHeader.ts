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
  
  // General truncation with ellipsis - properly declare and initialize truncated
  let truncated = text;
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

  // Draw complete header borders - fix extra line issue
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(1.0);
  
  // Draw outer border rectangle
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, headerRowHeight, 'S');
  
  // Draw vertical column separators - fix to avoid extra lines
  columnWidths.forEach((width, index) => {
    if (index > 0 && index < columnWidths.length) { // Don't draw line after last column
      const xPosition = PDF_CONFIG.pageMargin + columnWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
      pdf.setLineWidth(0.8);
      pdf.setDrawColor(...COLORS.white);
      pdf.line(xPosition, yPosition, xPosition, yPosition + headerRowHeight);
    }
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

  // Render header text with CENTER ALIGNMENT for all headers
  headers.forEach((header, index) => {
    const cellPadding = 2;
    const maxTextWidth = columnWidths[index] - (cellPadding * 2);
    const truncatedHeader = truncateHeaderText(pdf, header, maxTextWidth);
    const textY = yPosition + (headerRowHeight / 2) + 2;
    
    // CENTER ALIGN ALL HEADERS
    const textWidth = pdf.getTextWidth(truncatedHeader);
    const centeredX = columnPositions[index] + (columnWidths[index] / 2) - (textWidth / 2);
    pdf.text(truncatedHeader, centeredX, textY);
  });

  return yPosition + headerRowHeight;
};
