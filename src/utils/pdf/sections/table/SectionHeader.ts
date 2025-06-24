
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';

export const addSectionHeader = (
  pdf: jsPDF,
  sectionTitle: string,
  yPosition: number,
  isContinuation: boolean = false
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Clean the section title properly
  let cleanTitle = sectionTitle;
  try {
    // Handle encoding issues and clean text
    cleanTitle = sectionTitle
      .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable characters
      .replace(/\s+/g, ' ')
      .trim();
    
    // If still contains problematic characters or is empty, provide fallback
    if (!cleanTitle || cleanTitle.length < 2) {
      if (sectionTitle.toLowerCase().includes('civil') || sectionTitle.toLowerCase().includes('infrastructure')) {
        cleanTitle = 'Civil Infrastructure';
      } else if (sectionTitle.toLowerCase().includes('power') || sectionTitle.toLowerCase().includes('infrastructure')) {
        cleanTitle = 'Power Infrastructure';
      } else {
        cleanTitle = 'Service Section';
      }
    }
  } catch (error) {
    console.warn('Error cleaning section title:', error);
    cleanTitle = 'Service Section';
  }
  
  const displayTitle = isContinuation ? `${cleanTitle} (Continued)` : cleanTitle;
  
  // Enhanced section header with better visibility
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 16, 'F');
  
  // Add strong border for definition
  pdf.setDrawColor(...COLORS.black);
  pdf.setLineWidth(0.8);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 16, 'S');
  
  // Set text properties for better visibility
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  
  // Center the text vertically in the header
  pdf.text(displayTitle, PDF_CONFIG.pageMargin + 6, yPosition + 10);
  
  return yPosition + 20;
};
