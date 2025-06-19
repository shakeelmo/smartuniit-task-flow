
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

  // Improved service text extraction with better cleaning and fallback logic
  let serviceText = '';
  
  // Try multiple fields to get the service description
  if (item.service && typeof item.service === 'string') {
    serviceText = item.service;
  } else if (item.description && typeof item.description === 'string') {
    serviceText = item.description;
  } else if (item.name && typeof item.name === 'string') {
    serviceText = item.name;
  } else if (item.title && typeof item.title === 'string') {
    serviceText = item.title;
  }

  // Clean the text thoroughly to remove encoding issues
  serviceText = String(serviceText || '')
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep only printable ASCII and Latin extended
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // If still empty or contains garbage, provide a fallback
  if (!serviceText || serviceText.length < 2 || /^[^\w\s]*$/.test(serviceText)) {
    serviceText = 'Service Item';
  }

  const partNumberText = String(item.partNumber || '').replace(/[^\x20-\x7E]/g, '').trim() || '-';
  const unitText = String(item.unit || '').replace(/[^\x20-\x7E]/g, '').trim() || '-';

  console.log('Processing item:', { 
    originalService: item.service, 
    cleanedService: serviceText, 
    partNumber: partNumberText, 
    unit: unitText, 
    quantity: item.quantity, 
    unitPrice: item.unitPrice 
  });

  // Calculate text wrapping for description
  const descriptionColumnIndex = 1;
  const maxServiceWidth = columnWidths[descriptionColumnIndex] - 8;
  const wrappedServiceLines = wrapText(pdf, serviceText, maxServiceWidth);
  const requiredRowHeight = Math.max(baseRowHeight, wrappedServiceLines.length * 5 + 8);

  // Alternating row colors
  if (index % 2 === 0) {
    pdf.setFillColor(255, 255, 255);
  } else {
    pdf.setFillColor(248, 250, 252);
  }
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, requiredRowHeight, 'F');

  // Enhanced cell borders - draw all borders consistently
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  
  // Draw horizontal borders
  pdf.line(PDF_CONFIG.pageMargin, yPosition, PDF_CONFIG.pageMargin + tableWidth, yPosition);
  pdf.line(PDF_CONFIG.pageMargin, yPosition + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, yPosition + requiredRowHeight);
  
  // Draw vertical borders for each column
  let currentX = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, colIndex) => {
    // Left border of each column (first column uses page margin)
    if (colIndex === 0) {
      pdf.line(currentX, yPosition, currentX, yPosition + requiredRowHeight);
    }
    currentX += width;
    // Right border of each column
    pdf.line(currentX, yPosition, currentX, yPosition + requiredRowHeight);
  });

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

  // Service/Description column - ensure clean text is displayed
  const serviceStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedServiceLines.length * 5)) / 2 + 4);
  if (wrappedServiceLines.length > 0 && wrappedServiceLines[0] && wrappedServiceLines[0].trim()) {
    wrappedServiceLines.forEach((line, lineIndex) => {
      const cleanLine = line.trim();
      if (cleanLine) {
        pdf.text(cleanLine, columnPositions[colIndex] + cellPadding, serviceStartY + (lineIndex * 5));
      }
    });
  } else {
    // Direct fallback if wrapping fails
    pdf.text(serviceText, columnPositions[colIndex] + cellPadding, serviceStartY);
  }
  colIndex++;

  // Part Number column (if present)
  if (hasPartNumbers) {
    const maxPartWidth = columnWidths[colIndex] - 6;
    const wrappedPartLines = wrapText(pdf, partNumberText, maxPartWidth);
    const partStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedPartLines.length * 5)) / 2 + 4);
    wrappedPartLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + cellPadding, partStartY + (lineIndex * 5));
    });
    colIndex++;
  }

  // Quantity column - centered
  const qtyText = String(item.quantity || 0);
  const qtyWidth = pdf.getTextWidth(qtyText);
  const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
  pdf.text(qtyText, qtyX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
  colIndex++;

  // Unit column (if present)
  if (hasUnits) {
    const maxUnitWidth = columnWidths[colIndex] - 6;
    const wrappedUnitLines = wrapText(pdf, unitText, maxUnitWidth);
    const unitStartY = yPosition + Math.max(9, (requiredRowHeight - (wrappedUnitLines.length * 5)) / 2 + 4);
    wrappedUnitLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[colIndex] + cellPadding, unitStartY + (lineIndex * 5));
    });
    colIndex++;
  }

  // Unit Price column - right aligned with proper spacing
  const unitPriceValue = parseFloat(item.unitPrice) || 0;
  const unitPriceFormatted = unitPriceValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SR` : `$${unitPriceFormatted}`;
  const unitPriceWidth = pdf.getTextWidth(unitPriceText);
  const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - cellPadding;
  pdf.text(unitPriceText, unitPriceX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));
  colIndex++;

  // Total Price column - right aligned with increased padding for better visibility
  const quantityValue = parseFloat(item.quantity) || 0;
  const totalValue = quantityValue * unitPriceValue;
  const totalFormatted = totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  
  // Increased padding to ensure text is not cut off
  const totalPadding = 8; // Increased from 3 to 8
  const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - totalPadding;
  
  console.log('Total price display:', { 
    totalValue, 
    totalFormatted, 
    totalText, 
    totalX, 
    columnWidth: columnWidths[colIndex],
    textWidth: totalWidth,
    padding: totalPadding
  });
  
  pdf.text(totalText, totalX, yPosition + Math.max(9, (requiredRowHeight / 2) + 1));

  return yPosition + requiredRowHeight;
};
