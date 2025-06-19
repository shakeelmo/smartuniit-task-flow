
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

// Helper function to safely render text
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

export const addTableRow = (
  pdf: jsPDF,
  item: any,
  index: number,
  yPosition: number,
  config: TableRowConfig
): number => {
  const { hasPartNumbers, hasUnits, columnWidths, columnPositions, tableWidth, currency } = config;
  const baseRowHeight = 14;

  // Enhanced service text extraction with priority for service name
  let serviceText = '';
  
  // First priority: service field (this is the actual service name)
  if (item.service && typeof item.service === 'string' && item.service.trim()) {
    serviceText = item.service.trim();
  }
  // Second priority: name field
  else if (item.name && typeof item.name === 'string' && item.name.trim()) {
    serviceText = item.name.trim();
  }
  // Third priority: title field
  else if (item.title && typeof item.title === 'string' && item.title.trim()) {
    serviceText = item.title.trim();
  }
  // Fallback: create a default service name
  else {
    serviceText = `Service Item ${index + 1}`;
  }

  // Clean the service text thoroughly
  serviceText = String(serviceText || '')
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // If text is still empty or too short, provide a meaningful fallback
  if (!serviceText || serviceText.length < 2) {
    serviceText = `Service Item ${index + 1}`;
  }

  // Enhanced description text handling - separate from service name
  let descriptionText = '';
  if (item.description && typeof item.description === 'string' && item.description.trim()) {
    descriptionText = String(item.description).trim()
      .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
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
  if (item.unit && typeof item.unit === 'string' && item.unit.trim()) {
    unitText = String(item.unit).replace(/[^\x20-\x7E]/g, '').trim();
  } else if (item.units && typeof item.units === 'string' && item.units.trim()) {
    unitText = String(item.units).replace(/[^\x20-\x7E]/g, '').trim();
  } else if (item.unitType && typeof item.unitType === 'string' && item.unitType.trim()) {
    unitText = String(item.unitType).replace(/[^\x20-\x7E]/g, '').trim();
  }
  
  // Provide default unit if still empty
  if (!unitText) {
    unitText = 'Each';
  }

  // Calculate text wrapping for both service and description
  const serviceColumnIndex = 1; // Service column
  const maxServiceWidth = columnWidths[serviceColumnIndex] - 8;
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
    const descriptionColumnIndex = hasPartNumbers ? 3 : 2; // Description column position
    const maxDescriptionWidth = columnWidths[descriptionColumnIndex] - 8;
    const rawDescriptionLines = wrapText(pdf, descriptionText, maxDescriptionWidth);
    wrappedDescriptionLines = rawDescriptionLines.slice(0, 2); // Limit to 2 lines
    
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
    partColumnIndex = 2; // Part number is the 3rd column (index 2)
    const cellPadding = 3;
    const maxPartWidth = columnWidths[partColumnIndex] - (cellPadding * 2);
    
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
  
  // Draw vertical borders
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
  const cellPadding = 3;

  // SERIAL NUMBER COLUMN - centered and clearly visible
  const serialNumber = index + 1;
  const serialText = String(serialNumber);
  pdf.setFont('helvetica', 'bold');
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  const textY = yPosition + Math.max(9, (requiredRowHeight / 2) + 1);
  
  // Validate coordinates before rendering
  if (!isNaN(serialX) && !isNaN(textY)) {
    safeText(pdf, serialText, serialX, textY);
  }
  pdf.setFont('helvetica', 'normal');
  colIndex++;

  // SERVICE NAME COLUMN - left aligned with controlled wrapping
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (limitedServiceLines.length * 5)) / 2 + 4);
  pdf.setFont('helvetica', 'bold'); // Make service name bold
  limitedServiceLines.forEach((line, lineIndex) => {
    const cleanLine = String(line || '').trim();
    if (cleanLine && cleanLine.length > 0) {
      const serviceX = columnPositions[colIndex] + cellPadding;
      const serviceY = serviceStartY + (lineIndex * 5);
      if (!isNaN(serviceX) && !isNaN(serviceY)) {
        safeText(pdf, cleanLine, serviceX, serviceY);
      }
    }
  });
  pdf.setFont('helvetica', 'normal'); // Reset font
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
    const unitWidth = pdf.getTextWidth(unitText);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    if (!isNaN(unitX) && !isNaN(textY)) {
      safeText(pdf, unitText, unitX, textY);
    }
    colIndex++;
  }

  // UNIT PRICE COLUMN - right aligned with currency
  const unitPriceValue = Number(item.unitPrice) || 0;
  const unitPriceFormatted = unitPriceValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SAR` : `$${unitPriceFormatted}`;
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  if (!isNaN(unitPriceX) && !isNaN(textY)) {
    safeText(pdf, unitPriceText, unitPriceX, textY);
  }
  colIndex++;

  // TOTAL PRICE COLUMN - right aligned with currency
  const quantityValue = Number(item.quantity) || 0;
  const totalValue = quantityValue * unitPriceValue;
  const totalFormatted = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = currency === 'SAR' ? `${totalFormatted} SAR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  pdf.setFont('helvetica', 'bold');
  if (!isNaN(totalX) && !isNaN(textY)) {
    safeText(pdf, totalText, totalX, textY);
  }

  return yPosition + requiredRowHeight;
};
