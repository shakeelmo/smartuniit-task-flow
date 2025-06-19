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
  const baseRowHeight = 14;

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

  console.log('Extracted service text:', serviceText);

  // Clean the service text thoroughly
  serviceText = String(serviceText)
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Enhanced description text handling
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

  // Calculate text wrapping with improved column widths and more conservative padding
  const cellPadding = 1; // Reduced padding to maximize text space
  
  // For description column (always index 1)
  const descriptionColumnIndex = 1;
  const maxDescriptionWidth = Math.max(columnWidths[descriptionColumnIndex] - (cellPadding * 2), 10);
  
  // DISPLAY SERVICE INFO AS PRIMARY TEXT with description as secondary
  const combinedText = descriptionText ? `${serviceText}\n${descriptionText}` : serviceText;
  const wrappedDescriptionLines = wrapText(pdf, combinedText, maxDescriptionWidth);
  
  // Limit to maximum 2 lines
  const limitedDescriptionLines = wrappedDescriptionLines.slice(0, 2);
  if (wrappedDescriptionLines.length > 2) {
    let lastLine = limitedDescriptionLines[1] || '';
    while (pdf.getTextWidth(lastLine + '...') > maxDescriptionWidth && lastLine.length > 1) {
      lastLine = lastLine.slice(0, -1);
    }
    limitedDescriptionLines[1] = lastLine + '...';
  }

  // Enhanced Part Number column handling
  let wrappedPartLines: string[] = [];
  let partColumnIndex = -1;
  if (hasPartNumbers) {
    partColumnIndex = 2;
    const maxPartWidth = Math.max(columnWidths[partColumnIndex] - (cellPadding * 2), 8);
    
    const partNumberWidth = pdf.getTextWidth(partNumberText);
    
    if (partNumberWidth <= maxPartWidth) {
      wrappedPartLines = [partNumberText];
    } else {
      const roughWrappedLines = wrapText(pdf, partNumberText, maxPartWidth);
      wrappedPartLines = roughWrappedLines.slice(0, 1);
      
      if (roughWrappedLines.length > 1) {
        let truncatedLine = wrappedPartLines[0];
        while (pdf.getTextWidth(truncatedLine + '...') > maxPartWidth && truncatedLine.length > 1) {
          truncatedLine = truncatedLine.slice(0, -1);
        }
        wrappedPartLines[0] = truncatedLine + '...';
      }
    }
  }
  
  // Calculate required row height based on the tallest column
  const maxLines = Math.max(
    limitedDescriptionLines.length,
    wrappedPartLines.length,
    1
  );
  const requiredRowHeight = Math.max(baseRowHeight, maxLines * 5 + 8);

  // Alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255);
  } else {
    pdf.setFillColor(248, 250, 252);
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Enhanced border system - Draw complete grid with FIXED EXTRA LINE ISSUE
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  
  // Draw horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Draw vertical borders with proper positioning - FIXED TO PREVENT EXTRA LINES
  let currentXPosition = PDF_CONFIG.pageMargin;
  
  // Left border of table
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  
  // Internal column separators - AVOID DRAWING EXTRA LINE AFTER LAST COLUMN
  columnWidths.forEach((width, colIndex) => {
    currentXPosition += width;
    // Only draw separator if it's not the last column
    if (colIndex < columnWidths.length - 1) {
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
    }
  });
  
  // Right border of table
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(PDF_CONFIG.pageMargin + tableWidth, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);

  // Set text properties
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  let colIndex = 0;

  // SERIAL NUMBER COLUMN - centered and clearly visible
  const serialNumber = index + 1;
  const serialText = String(serialNumber);
  pdf.setFont('helvetica', 'bold');
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  const textY = yPosition + Math.max(9, (requiredRowHeight / 2) + 1);
  
  console.log('Rendering serial number:', { serialText, serialX, textY });
  if (!isNaN(serialX) && !isNaN(textY)) {
    safeText(pdf, serialText, serialX, textY);
  }
  pdf.setFont('helvetica', 'normal');
  colIndex++;

  // DESCRIPTION COLUMN - left aligned with controlled wrapping (combines service + description)
  const descStartY = yPosition + Math.max(9, (requiredRowHeight - (limitedDescriptionLines.length * 5)) / 2 + 4);
  pdf.setFont('helvetica', 'bold');
  console.log('Rendering description lines:', { limitedDescriptionLines, descStartY });
  
  limitedDescriptionLines.forEach((line, lineIndex) => {
    const cleanLine = String(line || '').trim();
    if (cleanLine && cleanLine.length > 0) {
      const descX = columnPositions[colIndex] + cellPadding;
      const descY = descStartY + (lineIndex * 5);
      console.log('Rendering description line:', { cleanLine, descX, descY });
      if (!isNaN(descX) && !isNaN(descY)) {
        safeText(pdf, cleanLine, descX, descY);
      }
    }
  });
  pdf.setFont('helvetica', 'normal');
  colIndex++;

  // PART NUMBER COLUMN (if present) - left aligned
  if (hasPartNumbers) {
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 5)) / 2 + 4);
    wrappedPartLines.forEach((line, lineIndex) => {
      const cleanLine = String(line || '').trim();
      if (cleanLine && cleanLine.length > 0) {
        const partX = columnPositions[colIndex] + cellPadding;
        const partY = partStartY + (lineIndex * 5);
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
  if (!isNaN(qtyX) && !isNaN(textY)) {
    safeText(pdf, qtyText, qtyX, textY);
  }
  colIndex++;

  // UNIT COLUMN (if present) - centered
  if (hasUnits) {
    const maxUnitWidth = columnWidths[colIndex] - (cellPadding * 2);
    const truncatedUnit = truncateTextToFit(pdf, unitText, maxUnitWidth);
    const unitWidth = pdf.getTextWidth(truncatedUnit);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    if (!isNaN(unitX) && !isNaN(textY)) {
      safeText(pdf, truncatedUnit, unitX, textY);
    }
    colIndex++;
  }

  // UNIT PRICE COLUMN - right aligned with currency, enhanced formatting
  const unitPriceValue = Number(item.unitPrice) || 0;
  const maxUnitPriceWidth = columnWidths[colIndex] - (cellPadding * 2);
  const unitPriceText = formatCurrency(unitPriceValue, currency, maxUnitPriceWidth, pdf);
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  
  if (!isNaN(unitPriceX) && !isNaN(textY)) {
    safeText(pdf, unitPriceText, unitPriceX, textY);
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
  if (!isNaN(totalX) && !isNaN(textY)) {
    safeText(pdf, totalText, totalX, textY);
  }
  pdf.setFont('helvetica', 'normal');

  return yPosition + requiredRowHeight;
};
