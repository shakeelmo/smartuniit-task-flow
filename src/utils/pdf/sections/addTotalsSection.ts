
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { calculateTotalsData } from './totals/TotalsCalculator';
import { renderTotalsSection } from './totals/TotalsRenderer';
import { addPageHeader } from './totals/PageHeaderRenderer';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 40; // Space reserved for footer

export const addTotalsSection = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  let currentY = yPosition;

  // Enhanced spacing and section height calculations
  const totalsSectionHeight = 70;
  
  // Check if we need a new page for totals section
  if (currentY + totalsSectionHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    currentY = addPageHeader(pdf, quotationData);
  }

  // Calculate totals data
  const totalsData = calculateTotalsData(quotationData);

  // Render the totals section
  return renderTotalsSection(pdf, totalsData, currentY);
};
