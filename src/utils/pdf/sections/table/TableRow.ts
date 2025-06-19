
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

// Helper function to format currency with proper spacing
const formatCurrency = (value: number, currency: 'SAR' | 'USD'): string => {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (currency === 'SAR') {
    return `${formatted} SAR`;
  } else {
    return `$${formatted}`;
  }
};

// Helper function to ensure text fits in column width
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

  // Calculate text wrapping with improved column widths
  const serviceColumnIndex = 1;
  const maxServiceWidth = Math.max(columnWidths[serviceColumnIndex] - 4, 15);
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  
  // Limit service name to maximum 2 lines
  const limitedServiceLines = wrappedServiceLines.slice(0, 2);
  if (wrappedServiceLines.length > 2) {
    let lastLine = limitedServiceLines[1] || '';
    while (pdf.getTextWidth(lastLine + '...') > maxServiceWidth && lastLine.length > 1) {
      lastLine = lastLine.slice(0, -1);
    }
    limitedServiceLines[1] = lastLine + '...';
  }

  // Handle description wrapping if we have description text
  let wrappedDescriptionLines: string[] = [];
  if (descriptionText) {
    const descriptionColumnIndex = hasPartNumbers ? 3 : 2;
    const maxDescriptionWidth = Math.max(columnWidths[descriptionColumnIndex] - 4, 15);
    const rawDescriptionLines = wrapText(pdf, descriptionText, maxDescriptionWidth);
    wrappedDescriptionLines = rawDescriptionLines.slice(0, 2);
    
    if (rawDescriptionLines.length > 2) {
      let lastLine = wrappedDescriptionLines[1] || '';
      while (pdf.getTextWidth(lastLine + '...') > maxDescriptionWidth && lastLine.length > 1) {
        lastLine = lastLine.slice(0, -1);
      }
      wrappedDescriptionLines[1] = lastLine + '...';
    }
  }

  // Enhanced Part Number column handling
  let wrappedPartLines: string[] = [];
  let partColumnIndex = -1;
  if (hasPartNumbers) {
    partColumnIndex = 2;
    const maxPartWidth = Math.max(columnWidths[partColumnIndex] - 4, 12);
    
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
    limitedServiceLines.length,
    wrappedDescriptionLines.length,
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

  // Enhanced border system - Draw complete grid
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  
  // Draw horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Draw vertical borders with proper positioning
  let currentXPosition = PDF_CONFIG.pageMargin;
  
  // Left border of table
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  
  // Internal column separators
  columnWidths.forEach((width, colIndex) => {
    currentXPosition += width;
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
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
  const cellPadding = 2; // Reduced padding for better fit

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

  // SERVICE NAME COLUMN - left aligned with controlled wrapping
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (limitedServiceLines.length * 5)) / 2 + 4);
  pdf.setFont('helvetica', 'bold');
  console.log('Rendering service lines:', { limitedServiceLines, serviceStartY });
  
  limitedServiceLines.forEach((line, lineIndex) => {
    const cleanLine = String(line || '').trim();
    if (cleanLine && cleanLine.length > 0) {
      const serviceX = columnPositions[colIndex] + cellPadding;
      const serviceY = serviceStartY + (lineIndex * 5);
      console.log('Rendering service line:', { cleanLine, serviceX, serviceY });
      if (!isNaN(serviceX) && !isNaN(serviceY)) {
        safeText(pdf, cleanLine, serviceX, serviceY);
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

  // DESCRIPTION COLUMN - left aligned with controlled wrapping
  if (wrappedDescriptionLines.length > 0) {
    const descStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedDescriptionLines.length * 5)) / 2 + 4);
    wrappedDescriptionLines.forEach((line, lineIndex) => {
      const cleanLine = String(line || '').trim();
      if (cleanLine && cleanLine.length > 0) {
        const descX = columnPositions[colIndex] + cellPadding;
        const descY = descStartY + (lineIndex * 5);
        if (!isNaN(descX) && !isNaN(descY)) {
          safeText(pdf, cleanLine, descX, descY);
        }
      }
    });
  }
  colIndex++;

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
    const truncatedUnit = truncateTextToFit(pdf, unitText, columnWidths[colIndex] - 4);
    const unitWidth = pdf.getTextWidth(truncatedUnit);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    if (!isNaN(unitX) && !isNaN(textY)) {
      safeText(pdf, truncatedUnit, unitX, textY);
    }
    colIndex++;
  }

  // UNIT PRICE COLUMN - right aligned with currency, improved formatting
  const unitPriceValue = Number(item.unitPrice) || 0;
  const unitPriceText = formatCurrency(unitPriceValue, currency);
  const maxUnitPriceWidth = columnWidths[colIndex] - (cellPadding * 2);
  const truncatedUnitPrice = truncateTextToFit(pdf, unitPriceText, maxUnitPriceWidth);
  const unitPriceWidth = pdf.getTextWidth(truncatedUnitPrice);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  
  if (!isNaN(unitPriceX) && !isNaN(textY)) {
    safeText(pdf, truncatedUnitPrice, unitPriceX, textY);
  }
  colIndex++;

  // TOTAL PRICE COLUMN - right aligned with currency, improved formatting
  const quantityValue = Number(item.quantity) || 0;
  const totalValue = quantityValue * unitPriceValue;
  const totalText = formatCurrency(totalValue, currency);
  const maxTotalWidth = columnWidths[colIndex] - (cellPadding * 2);
  const truncatedTotal = truncateTextToFit(pdf, totalText, maxTotalWidth);
  const totalWidth = pdf.getTextWidth(truncatedTotal);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  
  pdf.setFont('helvetica', 'bold');
  if (!isNaN(totalX) && !isNaN(textY)) {
    safeText(pdf, truncatedTotal, totalX, textY);
  }
  pdf.setFont('helvetica', 'normal');

  return yPosition + requiredRowHeight;
};
