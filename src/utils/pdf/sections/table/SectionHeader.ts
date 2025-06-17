
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';

export const addSectionHeader = (
  pdf: jsPDF,
  sectionTitle: string,
  yPosition: number,
  isContinuation: boolean = false
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  // Clean the section title to prevent encoding issues
  const cleanTitle = sectionTitle.replace(/[^\x20-\x7E]/g, '');
  const displayTitle = isContinuation ? `${cleanTitle} (Continued)` : cleanTitle;
  
  // Enhanced section header with improved styling
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 16, 'F');
  
  // Add border for definition
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.5);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 16, 'S');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(displayTitle, PDF_CONFIG.pageMargin + 6, yPosition + 11);
  
  return yPosition + 20;
};
