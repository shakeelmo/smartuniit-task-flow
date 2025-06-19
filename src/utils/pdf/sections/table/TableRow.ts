
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

  // Improved service text extraction with better cleaning
  let serviceText = '';
  
  if (item.service && typeof item.service === 'string') {
    serviceText = item.service;
  } else if (item.description && typeof item.description === 'string') {
    serviceText = item.description;
  } else if (item.name && typeof item.name === 'string') {
    serviceText = item.name;
  } else if (item.title && typeof item.title === 'string') {
    serviceText = item.title;
  }

  // Clean the text thoroughly
  serviceText = String(serviceText || '')
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!serviceText || serviceText.length < 2) {
    serviceText = 'Service Item';
  }

  // Enhanced part number text handling with strict width control
  let partNumberText = String(item.partNumber || '').replace(/[^\x20-\x7E]/g, '').trim() || '-';
  
  // Improved unit text handling - check multiple possible properties
  let unitText = '';
  if (item.unit && typeof item.unit === 'string' && item.unit.trim()) {
    unitText = String(item.unit).replace(/[^\x20-\x7E]/g, '').trim();
  } else if (item.units && typeof item.units === 'string' && item.units.trim()) {
    unitText = String(item.units).replace(/[^\x20-\x7E]/g, '').trim();
  } else if (item.unitType && typeof item.unitType === 'string' && item.unitType.trim()) {
    unitText = String(item.unitType).replace(/[^\x20-\x7E]/g, '').trim();
  }
  
  // If still no unit, provide a default
  if (!unitText) {
    unitText = 'Each';
  }

  // Calculate text wrapping for description
  const descriptionColumnIndex = 1;
  const maxServiceWidth = columnWidths[descriptionColumnIndex] - 8;
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  
  // Enhanced Part Number column handling with strict overflow prevention
  let wrappedPartLines: string[] = [];
  let partColumnIndex = -1;
  if (hasPartNumbers) {
    partColumnIndex = 2; // Part number is the 3rd column (index 2)
    const cellPadding = 3;
    const maxPartWidth = columnWidths[partColumnIndex] - (cellPadding * 2); // Account for padding on both sides
    
    // First, check if the part number fits on a single line
    const partNumberWidth = pdf.getTextWidth(partNumberText);
    
    if (partNumberWidth <= maxPartWidth) {
      // Part number fits on one line
      wrappedPartLines = [partNumberText];
    } else {
      // Part number is too long, use text wrapping with strict width control
      const roughWrappedLines = wrapText(pdf, partNumberText, maxPartWidth);
      
      // Double-check each wrapped line and truncate if necessary
      wrappedPartLines = roughWrappedLines.map(line => {
        const lineWidth = pdf.getTextWidth(line);
        if (lineWidth <= maxPartWidth) {
          return line;
        } else {
          // Truncate the line character by character until it fits
          let truncatedLine = line;
          while (pdf.getTextWidth(truncatedLine + '...') > maxPartWidth && truncatedLine.length > 1) {
            truncatedLine = truncatedLine.slice(0, -1);
          }
          return truncatedLine + (truncatedLine.length < line.length ? '...' : '');
        }
      });
      
      // Limit to maximum 3 lines for part numbers to prevent excessive row height
      if (wrappedPartLines.length > 3) {
        wrappedPartLines = wrappedPartLines.slice(0, 2);
        // Add ellipsis to the last line to indicate truncation
        const lastLine = wrappedPartLines[1];
        let truncatedLastLine = lastLine;
        while (pdf.getTextWidth(truncatedLastLine + '...') > maxPartWidth && truncatedLastLine.length > 1) {
          truncatedLastLine = truncatedLastLine.slice(0, -1);
        }
        wrappedPartLines[1] = truncatedLastLine + '...';
      }
    }
  }
  
  // Calculate required row height based on the tallest column
  const maxLines = Math.max(
    wrappedServiceLines.length,
    wrappedPartLines.length,
    1 // Minimum 1 line
  );
  const requiredRowHeight = Math.max(baseRowHeight, maxLines * 5 + 8);

  // Alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255);
  } else {
    pdf.setFillColor(248, 250, 252);
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // ENHANCED BORDER SYSTEM - Draw complete grid with consistent borders
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.5);
  
  // Draw horizontal borders (top and bottom of row)
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Draw ALL vertical borders systematically
  let currentXPosition = PDF_CONFIG.pageMargin;
  
  // Left border of table (darker)
  pdf.setLineWidth(0.8);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  
  // Internal column separators
  columnWidths.forEach((width, colIndex) => {
    currentXPosition += width;
    
    // Draw each vertical separator with consistent styling
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(180, 180, 180);
    pdf.line(currentXPosition, yPosition, currentXPosition, yPosition + requiredRowHeight);
  });
  
  // Right border of table (darker) - override the last separator
  pdf.setLineWidth(0.8);
  pdf.setDrawColor(...COLORS.black);
  pdf.line(PDF_CONFIG.pageMargin + tableWidth, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);

  // Set text properties
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  let colIndex = 0;
  const cellPadding = 3;

  // S# column - centered
  const serialText = (index + 1).toString();
  const serialWidth = pdf.getTextWidth(serialText);
  const serialX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (serialWidth / 2);
  pdf.text(serialText, serialX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
  colIndex++;

  // Service/Description column - left aligned with proper wrapping
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedServiceLines.length * 5)) / 2 + 4);
  wrappedServiceLines.forEach((line, lineIndex) => {
    const cleanLine = line.trim();
    if (cleanLine) {
      pdf.text(cleanLine, columnPositions[colIndex] + cellPadding, serviceStartY + (lineIndex * 5));
    }
  });
  colIndex++;

  // Part Number column (if present) - left aligned with guaranteed no overflow
  if (hasPartNumbers) {
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 5)) / 2 + 4);
    wrappedPartLines.forEach((line, lineIndex) => {
      const cleanLine = line.trim();
      if (cleanLine) {
        // Final safety check - ensure this line absolutely fits
        const safeLineWidth = columnWidths[colIndex] - (cellPadding * 2);
        const actualLineWidth = pdf.getTextWidth(cleanLine);
        
        if (actualLineWidth <= safeLineWidth) {
          pdf.text(cleanLine, columnPositions[colIndex] + cellPadding, partStartY + (lineIndex * 5));
        } else {
          // Emergency truncation - this should rarely happen with our improved logic
          let emergencyTruncated = cleanLine;
          while (pdf.getTextWidth(emergencyTruncated) > safeLineWidth && emergencyTruncated.length > 1) {
            emergencyTruncated = emergencyTruncated.slice(0, -1);
          }
          pdf.text(emergencyTruncated, columnPositions[colIndex] + cellPadding, partStartY + (lineIndex * 5));
        }
      }
    });
    colIndex++;
  }

  // Quantity column - centered
  const qtyText = String(item.quantity || 0);
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
  colIndex++;

  // Unit column (if present) - centered
  if (hasUnits) {
    const unitWidth = pdf.getTextWidth(unitText);
    const unitX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (unitWidth / 2);
    pdf.text(unitText, unitX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
    colIndex++;
  }

  // Unit Price column - right aligned with simple SAR display
  const unitPriceValue = parseFloat(item.unitPrice) || 0;
  const unitPriceFormatted = unitPriceValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  // Use simple "SAR" text instead of Unicode symbol to avoid encoding issues
  const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SAR` : `$${unitPriceFormatted}`;
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  pdf.text(unitPriceText, unitPriceX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
  colIndex++;

  // Total Price column - right aligned with simple SAR display
  const quantityValue = parseFloat(item.quantity) || 0;
  const totalValue = quantityValue * unitPriceValue;
  const totalFormatted = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  // Use simple "SAR" text instead of Unicode symbol to avoid encoding issues
  const totalText = currency === 'SAR' ? `${totalFormatted} SAR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - cellPadding;
  pdf.text(totalText, totalX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));

  return yPosition + requiredRowHeight;
};
