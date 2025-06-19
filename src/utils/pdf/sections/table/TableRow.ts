import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';
import { wrapText } from './TextWrapper';

export interface TableRowConfig {
  hasPartNumbers: boolean;
  hasUnits: boolean;
  columnWidths: number[];
  columnPositions: number[];
  tableWidth: number;
  currency: 'SAR' | 'USD';
}

// Helper function to safely render text with better error handling
const safeText = (pdf: jsPDF, text: string, x: number, y: number) => {
  // Validate text
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return; // Skip rendering empty text
  }
  
  // Validate coordinates
  if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
    console.warn('Invalid coordinates for text:', { text, x, y });
    return;
  }
  
  // Clean and validate text one more time
  const cleanText = String(text).trim();
  if (cleanText.length === 0) {
    return;
  }
  
  try {
    pdf.text(cleanText, x, y);
  } catch (error) {
    console.error('Error rendering text:', { text: cleanText, x, y, error });
  }
};

// Enhanced function to format currency with SAR text instead of symbol
const formatCurrency = (value: number, currency: 'SAR' | 'USD', maxWidth?: number, pdf?: jsPDF): string => {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  let currencyText: string;
  if (currency === 'SAR') {
    currencyText = `${formatted} SAR`; // Use SAR text instead of symbol
  } else {
    currencyText = `$${formatted}`;
  }

  // If maxWidth and pdf are provided, truncate if necessary
  if (maxWidth && pdf) {
    const textWidth = pdf.getTextWidth(currencyText);
    if (textWidth > maxWidth) {
      // Try shorter format first
      const shortFormatted = Number(value).toFixed(0);
      const shortCurrencyText = currency === 'SAR' ? `${shortFormatted} SAR` : `$${shortFormatted}`;
      
      if (pdf.getTextWidth(shortCurrencyText) <= maxWidth) {
        return shortCurrencyText;
      }
      
      // If still too long, truncate with ellipsis
      let truncated = currencyText;
      while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 5) {
        truncated = truncated.slice(0, -1);
      }
      return truncated + '...';
    }
  }
  
  return currencyText;
};

// Helper function to ensure text fits in column width with smart truncation
const truncateTextToFit = (pdf: jsPDF, text: string, maxWidth: number): string => {
  if (!text || maxWidth <= 0) return '';
  
  const textWidth = pdf.getTextWidth(text);
  if (textWidth <= maxWidth) {
    return text;
  }
  
  // If text is too long, truncate and add ellipsis
  let truncated = text;
  while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated + '...';
};

export const addTableRow = (
  pdf: jsPDF,
  item: any,
  index: number,
  yPosition: number,
  config: TableRowConfig
): number => {
  const { hasPartNumbers, hasUnits, columnWidths, columnPositions, tableWidth, currency } = config;
  const baseRowHeight = 16; // Increased base height for professional appearance

  console.log('Processing item for row:', { item, index });

  // Enhanced service text extraction with better field mapping
  let serviceText = '';
  const serviceFields = ['service', 'name', 'title', 'serviceName', 'itemName'];
  for (const field of serviceFields) {
    if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
      serviceText = String(item[field]).trim();
      break;
    }
  }

  if (!serviceText || serviceText.length < 1) {
    serviceText = `Service Item ${index + 1}`;
  }

  // Enhanced description handling for professional presentation
  let descriptionText = '';
  const descriptionFields = ['description', 'desc', 'details'];
  for (const field of descriptionFields) {
    if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
      descriptionText = String(item[field]).trim()
        .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      break;
    }
  }

  // Enhanced part number text handling
  let partNumberText = '';
  if (item.partNumber && typeof item.partNumber === 'string' && item.partNumber.trim()) {
    partNumberText = String(item.partNumber).replace(/[^\x20-\x7E]/g, '').trim();
  }
  if (!partNumberText) {
    partNumberText = '-';
  }
  
  // Improved unit text handling
  let unitText = '';
  const unitFields = ['unit', 'units', 'unitType'];
  for (const field of unitFields) {
    if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
      unitText = String(item[field]).replace(/[^\x20-\x7E]/g, '').trim();
      break;
    }
  }
  
  if (!unitText) {
    unitText = 'Each';
  }

  // Enhanced text wrapping with optimized spacing
  const cellPadding = 1.5; // Professional minimal padding
  
  // For description column (always index 1)
  const descriptionColumnIndex = 1;
  const maxDescriptionWidth = Math.max(columnWidths[descriptionColumnIndex] - (cellPadding * 2), 15);
  
  // Professional text combination - service as primary, description as detail
  const combinedText = descriptionText ? `${serviceText}\n${descriptionText}` : serviceText;
  const wrappedDescriptionLines = wrapText(pdf, combinedText, maxDescriptionWidth, PDF_CONFIG.fontSize.normal);

  // Enhanced Part Number column handling with professional formatting
  let wrappedPartLines: string[] = [];
  let partColumnIndex = -1;
  if (hasPartNumbers) {
    partColumnIndex = 2;
    const maxPartWidth = Math.max(columnWidths[partColumnIndex] - (cellPadding * 2), 10);
    
    let partNumberText = '';
    if (item.partNumber && typeof item.partNumber === 'string' && item.partNumber.trim()) {
      partNumberText = String(item.partNumber).replace(/[^\x20-\x7E]/g, '').trim();
    }
    if (!partNumberText) {
      partNumberText = '-';
    }
    
    wrappedPartLines = wrapText(pdf, partNumberText, maxPartWidth, PDF_CONFIG.fontSize.small);
  }
  
  // Calculate professional row height based on content
  const maxLines = Math.max(
    wrappedDescriptionLines.length,
    wrappedPartLines.length,
    1
  );
  // Enhanced spacing for professional appearance
  const requiredRowHeight = Math.max(baseRowHeight, maxLines * 5.5 + 10);

  // Professional alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255); // Pure white
  } else {
    pdf.setFillColor(248, 250, 252); // Subtle gray
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Enhanced border system for professional grid appearance
  pdf.setDrawColor(220, 220, 220); // Lighter professional gray
  pdf.setLineWidth(0.3);
  
  // Top and bottom borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Vertical separators with consistent spacing
  columnPositions.forEach((position, colIndex) => {
    if (colIndex > 0 && colIndex < columnPositions.length) {
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(230, 230, 230);
      pdf.line(position, yPosition, position, yPosition + requiredRowHeight);
    }
  });
  
  // Professional outer borders
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin, yPosition + requiredRowHeight);
  pdf.line(PDF_CONFIG.pageMargin + tableWidth, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);

  // Enhanced text rendering with professional typography
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  let colIndex = 0;
  const textYCenter = yPosition + (requiredRowHeight / 2) + 1.5;

  // SERIAL NUMBER - Professional centered display
  const serialNumber = index + 1;
  const serialText = String(serialNumber);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  
  if (!isNaN(serialX) && !isNaN(textYCenter)) {
    safeText(pdf, serialText, serialX, textYCenter);
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  colIndex++;

  // DESCRIPTION - Professional multi-line display with optimal spacing
  const descStartY = yPosition + 6;
  wrappedDescriptionLines.forEach((line, lineIndex) => {
    const cleanLine = String(line || '').trim();
    if (cleanLine && cleanLine.length > 0) {
      // First line (service) in bold, subsequent lines (description) in normal
      if (lineIndex === 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.normal);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.small);
      }
      
      const descX = columnPositions[colIndex] + cellPadding;
      const descY = descStartY + (lineIndex * 5.5);
      
      if (!isNaN(descX) && !isNaN(descY)) {
        safeText(pdf, cleanLine, descX, descY);
      }
    }
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  colIndex++;

  // PART NUMBER COLUMN (if present) - left aligned
  if (hasPartNumbers) {
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 6)) / 2 + 4);
    wrappedPartLines.forEach((line, lineIndex) => {
      const cleanLine = String(line || '').trim();
      if (cleanLine && cleanLine.length > 0) {
        const partX = columnPositions[colIndex] + cellPadding;
        const partY = partStartY + (lineIndex * 6);
        if (!isNaN(partX) && !isNaN(partY)) {
          safeText(pdf, cleanLine, partX, partY);
        }
      }
    });
    colIndex++;
  }

  // QUANTITY COLUMN - centered
  const quantity = Number(item.quantity) || 0;
  const qtyText = String(quantity);
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  if (!isNaN(qtyX) && !isNaN(textYCenter)) {
    safeText(pdf, qtyText, qtyX, textYCenter);
  }
  colIndex++;

  // UNIT COLUMN (if present) - centered
  if (hasUnits) {
    const maxUnitWidth = columnWidths[colIndex] - (cellPadding * 2);
    const truncatedUnit = truncateTextToFit(pdf, unitText, maxUnitWidth);
    const unitWidth = pdf.getTextWidth(truncatedUnit);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    if (!isNaN(unitX) && !isNaN(textYCenter)) {
      safeText(pdf, truncatedUnit, unitX, textYCenter);
    }
    colIndex++;
  }

  // UNIT PRICE COLUMN - right aligned with currency, enhanced formatting
  const unitPriceValue = Number(item.unitPrice) || 0;
  const maxUnitPriceWidth = columnWidths[colIndex] - (cellPadding * 2);
  const unitPriceText = formatCurrency(unitPriceValue, currency, maxUnitPriceWidth, pdf);
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  
  if (!isNaN(unitPriceX) && !isNaN(textYCenter)) {
    safeText(pdf, unitPriceText, unitPriceX, textYCenter);
  }
  colIndex++;

  // TOTAL PRICE COLUMN - right aligned with currency, enhanced formatting
  const quantityValue = Number(item.quantity) || 0;
  const totalValue = quantityValue * unitPriceValue;
  const maxTotalWidth = columnWidths[colIndex] - (cellPadding * 2);
  const totalText = formatCurrency(totalValue, currency, maxTotalWidth, pdf);
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  if (!isNaN(totalX) && !isNaN(textYCenter)) {
    safeText(pdf, totalText, totalX, textYCenter);
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  return yPosition + requiredRowHeight;
};
