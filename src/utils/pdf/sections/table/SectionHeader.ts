
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';

export const addSectionHeader = (
  pdf: jsPDF,
  sectionTitle: string,
  yPosition: number,
  isContinuation: boolean = false
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const displayTitle = isContinuation ? `${sectionTitle} (Continued)` : sectionTitle;
  
  // Add section header with enhanced styling
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 15, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(displayTitle, PDF_CONFIG.pageMargin + 5, yPosition + 10);
  
  return yPosition + 18;
};
