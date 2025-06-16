
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { getCurrencyInfo } from '../helpers';

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
    // Render sections with headers
    quotationData.sections!.forEach((section, sectionIndex) => {
      // Add section header
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, currentY, pageWidth - 2 * PDF_CONFIG.pageMargin, 8, 'F');
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.normal);
      pdf.text(section.title, PDF_CONFIG.pageMargin + 5, currentY + 6);
      
      currentY += 10;
      
      // Render table for this section
      currentY = renderTableSection(pdf, section.lineItems, quotationData, currentY);
      currentY += 5; // Add spacing between sections
    });
  } else {
    // Render flat line items (backward compatibility)
    currentY = renderTableSection(pdf, quotationData.lineItems, quotationData, currentY);
  }

  return currentY;
};

const renderTableSection = (
  pdf: jsPDF,
  lineItems: any[],
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableStartY = yPosition;

  const hasPartNumbers = lineItems.some(item => item.partNumber && item.partNumber.trim());
  const hasUnits = lineItems.some(item => item.unit && item.unit.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;

  // Adjust column widths based on what columns are shown
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    columnWidths = [10, 40, 15, 12, 12, 30, 35];
  } else if (hasPartNumbers) {
    columnWidths = [12, 48, 20, 15, 35, 40];
  } else if (hasUnits) {
    columnWidths = [12, 60, 15, 12, 35, 40];
  } else {
    columnWidths = [12, 70, 18, 35, 40];
  }

  const columnPositions: number[] = [];
  let currentX = PDF_CONFIG.pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  // Table header
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, tableStartY, tableWidth, PDF_CONFIG.rowHeight, 'F');

  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  let headers: string[];
  if (hasPartNumbers && hasUnits) {
    headers = ['S#', 'Item', 'Part#', 'Qty', 'Unit', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  } else if (hasPartNumbers) {
    headers = ['S#', 'Item', 'Part#', 'Qty', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  } else if (hasUnits) {
    headers = ['S#', 'Item', 'Qty', 'Unit', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  } else {
    headers = ['S#', 'Item', 'Quantity', `Unit Price\n(${quotationData.currency})`, `Total Price\n(${quotationData.currency})`];
  }

  headers.forEach((header, index) => {
    const x = columnPositions[index] + 2;
    if (header.includes('\n')) {
      const lines = header.split('\n');
      pdf.text(lines[0], x, tableStartY + 4);
      pdf.text(lines[1], x, tableStartY + 7);
    } else {
      pdf.text(header, x, tableStartY + 6);
    }
  });

  let currentY = tableStartY + PDF_CONFIG.rowHeight;
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  // Table rows
  lineItems.forEach((item, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
    }

    pdf.text((index + 1).toString(), columnPositions[0] + 2, currentY + 6);

    const maxItemLength = hasPartNumbers && hasUnits ? 15 : hasPartNumbers ? 18 : hasUnits ? 23 : 28;
    const cleanServiceText = String(item.service || '').replace(/[^\x20-\x7E]/g, '');
    const itemText = cleanServiceText.length > maxItemLength
      ? cleanServiceText.substring(0, maxItemLength) + '...' : cleanServiceText;
    pdf.text(itemText, columnPositions[1] + 2, currentY + 6);

    let colIndex = 2;
    
    if (hasPartNumbers) {
      const partText = item.partNumber || '-';
      const maxPartLength = 8;
      const truncatedPart = partText.length > maxPartLength
        ? partText.substring(0, maxPartLength) + '...' : partText;
      pdf.text(truncatedPart, columnPositions[colIndex] + 2, currentY + 6);
      colIndex++;
    }

    const qtyText = item.quantity.toString();
    const qtyWidth = pdf.getTextWidth(qtyText);
    const qtyX = columnPositions[colIndex] + (columnWidths[colIndex] / 2) - (qtyWidth / 2);
    pdf.text(qtyText, qtyX, currentY + 6);
    colIndex++;

    if (hasUnits) {
      const unitText = item.unit || '-';
      const maxUnitLength = 6;
      const truncatedUnit = unitText.length > maxUnitLength
        ? unitText.substring(0, maxUnitLength) + '...' : unitText;
      pdf.text(truncatedUnit, columnPositions[colIndex] + 2, currentY + 6);
      colIndex++;
    }

    const unitPriceText = item.unitPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const unitPriceWidth = pdf.getTextWidth(unitPriceText);
    const unitPriceX = columnPositions[colIndex] + columnWidths[colIndex] - unitPriceWidth - 2;
    pdf.text(unitPriceText, unitPriceX, currentY + 6);
    colIndex++;

    const totalValue = item.quantity * item.unitPrice;
    const totalText = totalValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const totalWidth = pdf.getTextWidth(totalText);
    const totalX = columnPositions[colIndex] + columnWidths[colIndex] - totalWidth - 2;
    pdf.text(totalText, totalX, currentY + 6);

    currentY += PDF_CONFIG.rowHeight;
  });

  return currentY;
};
