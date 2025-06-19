
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

export const addTableRow = (
  pdf: jsPDF,
  item: any,
  index: number,
  yPosition: number,
  config: TableRowConfig
): number => {
  const { hasPartNumbers, hasUnits, columnWidths, columnPositions, tableWidth, currency } = config;
  const baseRowHeight = 14;

  // Improved service text extraction with better cleaning and fallback
  let serviceText = '';
  
  if (item.service && typeof item.service === 'string' && item.service.trim()) {
    serviceText = item.service.trim();
  } else if (item.description && typeof item.description === 'string' && item.description.trim()) {
    serviceText = item.description.trim();
  } else if (item.name && typeof item.name === 'string' && item.name.trim()) {
    serviceText = item.name.trim();
  } else if (item.title && typeof item.title === 'string' && item.title.trim()) {
    serviceText = item.title.trim();
  }

  // Clean the text thoroughly and provide fallback
  serviceText = String(serviceText || '')
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // If text is still empty or too short, provide a meaningful fallback
  if (!serviceText || serviceText.length < 2) {
    serviceText = `Service Item ${index + 1}`;
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

  // Calculate text wrapping for description with controlled width
  const descriptionColumnIndex = 1;
  const maxServiceWidth = columnWidths[descriptionColumnIndex] - 8; // More padding
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  
  // Limit description to maximum 2 lines to prevent excessive row height
  const limitedServiceLines = wrappedServiceLines.slice(0, 2);
  if (wrappedServiceLines.length > 2) {
    // Truncate the second line and add ellipsis
    let lastLine = limitedServiceLines[1] || '';
    while (pdf.getTextWidth(lastLine + '...') > maxServiceWidth && lastLine.length > 1) {
      lastLine = lastLine.slice(0, -1);
    }
    limitedServiceLines[1] = lastLine + '...';
  }

  // Enhanced Part Number column handling with strict overflow prevention
  let wrappedPartLines: string[] = [];
  let partColumnIndex = -1;
  if (hasPartNumbers) {
    partColumnIndex = 2; // Part number is the 3rd column (index 2)
    const cellPadding = 3;
    const maxPartWidth = columnWidths[partColumnIndex] - (cellPadding * 2);
    
    // Check if the part number fits on a single line
    const partNumberWidth = pdf.getTextWidth(partNumberText);
    
    if (partNumberWidth <= maxPartWidth) {
      wrappedPartLines = [partNumberText];
    } else {
      // Part number is too long, wrap with truncation
      const roughWrappedLines = wrapText(pdf, partNumberText, maxPartWidth);
      wrappedPartLines = roughWrappedLines.slice(0, 1); // Limit to 1 line for part numbers
      
      // Ensure it fits with ellipsis if needed
      if (roughWrappedLines.length > 1) {
        let truncatedLine = wrappedPartLines[0];
        while (pdf.getTextWidth(truncatedLine + '...') > maxPartWidth && truncatedLine.length > 1) {
          truncatedLine = truncatedLine.slice(0, -1);
        }
        wrappedPartLines[0] = truncatedLine + '...';
      }
    }
  }
  
  // Calculate required row height based on the tallest column (max 2 lines for descriptions)
  const maxLines = Math.max(
    limitedServiceLines.length,
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
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.5);
  
  // Draw horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Draw vertical borders
  let currentXPosition = PDF_CONFIG.pageMargin;
  
  // Left border of table
  pdf.setLineWidth(0.8);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  
  // Internal column separators
  columnWidths.forEach((width, colIndex) => {
    currentXPosition += width;
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(180, 180, 180);
    pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  });
  
  // Right border of table
  pdf.setLineWidth(0.8);
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
  const serialText = serialNumber.toString();
  pdf.setFont('helvetica', 'bold'); // Make serial number bold for visibility
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  const textY = yPosition + Math.max(9, (requiredRowHeight / 2) + 1);
  pdf.text(serialText, serialX, textY);
  pdf.setFont('helvetica', 'normal'); // Reset font
  colIndex++;

  // SERVICE/DESCRIPTION COLUMN - left aligned with controlled wrapping
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (limitedServiceLines.length * 5)) / 2 + 4);
  limitedServiceLines.forEach((line, lineIndex) => {
    const cleanLine = line.trim();
    if (cleanLine) {
      pdf.text(cleanLine, columnPositions[colIndex] + cellPadding, serviceStartY + (lineIndex * 5));
    }
  });
  colIndex++;

  // PART NUMBER COLUMN (if present) - left aligned with guaranteed no overflow
  if (hasPartNumbers) {
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 5)) / 2 + 4);
    wrappedPartLines.forEach((line, lineIndex) => {
      const cleanLine = line.trim();
      if (cleanLine) {
        pdf.text(cleanLine, columnPositions[colIndex] + cellPadding, partStartY + (lineIndex * 5));
      }
    });
    colIndex++;
  }

  // QUANTITY COLUMN - centered
  const qtyText = String(Number(item.quantity) || 0);
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, textY);
  colIndex++;

  // UNIT COLUMN (if present) - centered
  if (hasUnits) {
    const unitWidth = pdf.getTextWidth(unitText);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    pdf.text(unitText, unitX, textY);
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
  pdf.text(unitPriceText, unitPriceX, textY);
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
  pdf.setFont('helvetica', 'bold'); // Make total bold
  pdf.text(totalText, totalX, textY);

  return yPosition + requiredRowHeight;
};
