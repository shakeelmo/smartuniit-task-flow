
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { getCurrencyInfo } from '../helpers';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 40; // Space reserved for footer/totals

export const addTable = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;
  const currencyInfo = getCurrencyInfo(quotationData.currency);

  // Check if we have sections or flat line items
  const hasSections = quotationData.sections && quotationData.sections.length > 0;

  if (hasSections) {
    // Render sections with headers as separate table blocks
    quotationData.sections!.forEach((section, sectionIndex) => {
      // Check if we need a new page for section header
      if (currentY + 30 > PAGE_HEIGHT - BOTTOM_MARGIN) {
        pdf.addPage();
        currentY = addPageHeader(pdf, quotationData);
      }

      // Add section header with enhanced styling
      pdf.setFillColor(...COLORS.headerBlue);
      pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, 15, 'F');
      
      pdf.setTextColor(...COLORS.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      pdf.text(section.title, PDF_CONFIG.pageMargin + 5, currentY + 10);
      
      currentY += 18;
      
      // Render separate table for this section
      currentY = renderSectionTable(pdf, section.lineItems, quotationData, currentY, section.title);
      currentY += 15; // Add spacing between sections
    });
  } else {
    // Render flat line items (backward compatibility)
    currentY = renderSectionTable(pdf, quotationData.lineItems, quotationData, currentY);
  }

  return currentY;
};

const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Add basic header info on continuation pages
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Quotation (Continued)', PDF_CONFIG.pageMargin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(`Quote: ${quotationData.number}`, pageWidth - 80, yPosition);
  
  yPosition += 10;
  pdf.text(`Customer: ${quotationData.customer.companyName}`, PDF_CONFIG.pageMargin, yPosition);
  
  return yPosition + 15;
};

const renderSectionTable = (
  pdf: jsPDF,
  lineItems: any[],
  quotationData: QuotationData,
  yPosition: number,
  sectionTitle?: string
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  const hasPartNumbers = lineItems.some(item => item.partNumber && item.partNumber.trim());
  const hasUnits = lineItems.some(item => item.unit && item.unit.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;

  // Enhanced row height for better spacing and text wrapping
  const enhancedRowHeight = 12;

  // Improved column widths with better distribution
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    columnWidths = [12, 45, 18, 15, 15, 35, 35];
  } else if (hasPartNumbers) {
    columnWidths = [12, 55, 25, 20, 40, 45];
  } else if (hasUnits) {
    columnWidths = [12, 65, 18, 15, 40, 45];
  } else {
    columnWidths = [12, 75, 25, 40, 45];
  }

  const columnPositions: number[] = [];
  let currentX = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  // Function to wrap text within cell width
  const wrapText = (text: string, maxWidth: number, fontSize: number = PDF_CONFIG.fontSize.small): string[] => {
    pdf.setFontSize(fontSize);
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth <= maxWidth - 4) { // Account for padding
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Handle very long words that exceed cell width
          lines.push(word.substring(0, Math.floor(maxWidth / 3)) + '...');
          currentLine = '';
        }
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [''];
  };

  // Function to add table header for each section
  const addSectionTableHeader = (y: number) => {
    // Enhanced header with better styling and borders
    pdf.setFillColor(220, 220, 220); // Light gray background
    pdf.rect(PDF_CONFIG.pageMargin, y, tableWidth, enhancedRowHeight, 'FD');

    // Add border lines for header
    pdf.setDrawColor(...COLORS.black);
    pdf.setLineWidth(0.5);
    
    // Top border
    pdf.line(PDF_CONFIG.pageMargin, y, PDF_CONFIG.pageMargin + tableWidth, y);
    // Bottom border
    pdf.line(PDF_CONFIG.pageMargin, y + enhancedRowHeight, PDF_CONFIG.pageMargin + tableWidth, y + enhancedRowHeight);
    
    // Vertical borders
    let currentXPos = PDF_CONFIG.pageMargin;
    columnWidths.forEach((width, index) => {
      pdf.line(currentXPos, y, currentXPos, y + enhancedRowHeight);
      currentXPos += width;
    });
    // Right border
    pdf.line(currentXPos, y, currentXPos, y + enhancedRowHeight);

    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.normal);

    let headers: string[];
    if (hasPartNumbers && hasUnits) {
      headers = ['S#', 'Item Description', 'Part Number', 'Qty', 'Unit', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
    } else if (hasPartNumbers) {
      headers = ['S#', 'Item Description', 'Part Number', 'Qty', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
    } else if (hasUnits) {
      headers = ['S#', 'Item Description', 'Qty', 'Unit', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
    } else {
      headers = ['S#', 'Item Description', 'Quantity', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
    }

    headers.forEach((header, index) => {
      const x = columnPositions[index] + 3; // Add padding
      if (header.includes('\n')) {
        const lines = header.split('\n');
        pdf.text(lines[0], x, y + 5);
        pdf.text(lines[1], x, y + 9);
      } else {
        pdf.text(header, x, y + 8);
      }
    });

    return y + enhancedRowHeight;
  };

  // Add table header for this section
  currentY = addSectionTableHeader(currentY);

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  // Table rows with enhanced styling and pagination
  lineItems.forEach((item, index) => {
    // Calculate required height for this row based on text wrapping
    const serviceText = String(item.service || '').replace(/[^\x20-\x7E]/g, '');
    const maxServiceWidth = hasPartNumbers && hasUnits ? 40 : hasPartNumbers ? 50 : hasUnits ? 60 : 70;
    const wrappedServiceLines = wrapText(serviceText, maxServiceWidth);
    const requiredRowHeight = Math.max(enhancedRowHeight, wrappedServiceLines.length * 5 + 4);

    // Check if we need a new page
    if (currentY + requiredRowHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = addPageHeader(pdf, quotationData);
      
      // Re-add section title if continuing on new page
      if (sectionTitle) {
        pdf.setFillColor(...COLORS.headerBlue);
        pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, 15, 'F');
        
        pdf.setTextColor(...COLORS.white);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        pdf.text(`${sectionTitle} (Continued)`, PDF_CONFIG.pageMargin + 5, currentY + 10);
        
        currentY += 18;
      }
      
      currentY = addSectionTableHeader(currentY);
    }

    // Enhanced alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252); // Very light blue-gray
    } else {
      pdf.setFillColor(255, 255, 255); // White
    }
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, requiredRowHeight, 'F');

    // Add cell borders
    pdf.setDrawColor(200, 200, 200); // Light gray borders
    pdf.setLineWidth(0.3);
    
    // Horizontal borders
    pdf.line(PDF_CONFIG.pageMargin, currentY, PDF_CONFIG.pageMargin + tableWidth, currentY);
    pdf.line(PDF_CONFIG.pageMargin, currentY + requiredRowHeight, PDF_CONFIG.pageMargin + tableWidth, currentY + requiredRowHeight);
    
    // Vertical borders
    let currentXPos = PDF_CONFIG.pageMargin;
    columnWidths.forEach((width, index) => {
      pdf.line(currentXPos, currentY, currentXPos, currentY + requiredRowHeight);
      currentXPos += width;
    });
    pdf.line(currentXPos, currentY, currentXPos, currentY + requiredRowHeight);

    // Reset text properties
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);

    // S# column - centered with padding
    const serialText = (index + 1).toString();
    const serialWidth = pdf.getTextWidth(serialText);
    const serialX = columnPositions[0] + (columnWidths[0] / 2) - (serialWidth / 2);
    pdf.text(serialText, serialX, currentY + 8);

    // Service/Description column with proper text wrapping
    wrappedServiceLines.forEach((line, lineIndex) => {
      pdf.text(line, columnPositions[1] + 3, currentY + 8 + (lineIndex * 5));
    });

    let colIndex = 2;
    
    // Part Number column (if present)
    if (hasPartNumbers) {
      const partText = item.partNumber || '-';
      const wrappedPartLines = wrapText(partText, columnWidths[colIndex] - 6);
      wrappedPartLines.forEach((line, lineIndex) => {
        pdf.text(line, columnPositions[colIndex] + 3, currentY + 8 + (lineIndex * 5));
      });
      colIndex++;
    }

    // Quantity column - centered
    const qtyText = item.quantity.toString();
    const qtyWidth = pdf.getTextWidth(qtyText);
    const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
    pdf.text(qtyText, qtyX, currentY + 8);
    colIndex++;

    // Unit column (if present)
    if (hasUnits) {
      const unitText = item.unit || '-';
      const wrappedUnitLines = wrapText(unitText, columnWidths[colIndex] - 6);
      wrappedUnitLines.forEach((line, lineIndex) => {
        pdf.text(line, columnPositions[colIndex] + 3, currentY + 8 + (lineIndex * 5));
      });
      colIndex++;
    }

    // Unit Price column - right aligned with padding
    const unitPriceText = item.unitPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const unitPriceWidth = pdf.getTextWidth(unitPriceText);
    const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - 3;
    pdf.text(unitPriceText, unitPriceX, currentY + 8);
    colIndex++;

    // Total Price column - right aligned with padding
    const totalValue = item.quantity * item.unitPrice;
    const totalText = totalValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const totalWidth = pdf.getTextWidth(totalText);
    const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - 3;
    pdf.text(totalText, totalX, currentY + 8);

    currentY += requiredRowHeight;
  });

  // Add final bottom border for the table
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.line(PDF_CONFIG.pageMargin, currentY, PDF_CONFIG.pageMargin + tableWidth, currentY);

  return currentY;
};
