
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { addSectionHeader } from './table/SectionHeader';
import { addTableHeader, TableHeaderConfig } from './table/TableHeader';
import { addTableRow, TableRowConfig } from './table/TableRow';
import { calculateColumnConfig } from './table/ColumnCalculator';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 60; // Increased space reserved for footer/totals to prevent overlap

export const addTable = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  // Check if we have sections or flat line items
  const hasSections = quotationData.sections && quotationData.sections.length > 0;

  if (hasSections) {
    // Render sections with headers as separate table blocks
    quotationData.sections!.forEach((section, sectionIndex) => {
      // Check if we need a new page for section header with more conservative spacing
      if (currentY + 40 > PAGE_HEIGHT - BOTTOM_MARGIN) {
        pdf.addPage();
        currentY = addPageHeader(pdf, quotationData);
      }

      // Add section header
      currentY = addSectionHeader(pdf, section.title, currentY);
      
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

  // Calculate column configuration
  const { columnWidths, columnPositions } = calculateColumnConfig(
    hasPartNumbers,
    hasUnits,
    PDF_CONFIG.pageMargin
  );

  // Create configuration objects
  const headerConfig: TableHeaderConfig = {
    hasPartNumbers,
    hasUnits,
    currency: quotationData.currency,
    columnWidths,
    columnPositions,
    tableWidth
  };

  const rowConfig: TableRowConfig = {
    hasPartNumbers,
    hasUnits,
    columnWidths,
    columnPositions,
    tableWidth,
    currency: quotationData.currency
  };

  // Add table header for this section
  currentY = addTableHeader(pdf, currentY, headerConfig);

  // Table rows with enhanced styling and improved pagination
  lineItems.forEach((item, index) => {
    const estimatedRowHeight = 20; // Conservative estimate for row height
    
    // Check if we need a new page - be more conservative to prevent overlap
    if (currentY + estimatedRowHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = addPageHeader(pdf, quotationData);
      
      // Re-add section title if continuing on new page
      if (sectionTitle) {
        currentY = addSectionHeader(pdf, sectionTitle, currentY, true);
      }
      
      currentY = addTableHeader(pdf, currentY, headerConfig);
    }

    const previousY = currentY;
    currentY = addTableRow(pdf, item, index, currentY, rowConfig);
    
    // Safety check: if row was too big and we're close to bottom, start new page
    if (currentY > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = addPageHeader(pdf, quotationData);
      
      // Re-add section title if continuing on new page
      if (sectionTitle) {
        currentY = addSectionHeader(pdf, sectionTitle, currentY, true);
      }
      
      currentY = addTableHeader(pdf, currentY, headerConfig);
      // Re-render the row on the new page
      currentY = addTableRow(pdf, item, index, currentY, rowConfig);
    }
  });

  // Add final bottom border for the table
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.line(PDF_CONFIG.pageMargin, currentY, PDF_CONFIG.pageMargin + tableWidth, currentY);

  return currentY;
};
