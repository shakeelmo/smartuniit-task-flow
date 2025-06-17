import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../../constants';

export const addSectionHeader = (
  pdf: jsPDF,
  sectionTitle: string,
  yPosition: number,
  isContinuation: boolean = false
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Clean the section title to prevent encoding issues and handle Arabic/Unicode text properly
  let cleanTitle = sectionTitle;
  try {
    // Try to decode if it's encoded
    if (sectionTitle.includes('Þ') || sectionTitle.includes('ß') || sectionTitle.includes('°')) {
      // This appears to be corrupted encoding, try to fix common patterns
      cleanTitle = sectionTitle
        .replace(/Þ°/g, 'ا')
        .replace(/Þç/g, 'ل')
        .replace(/Þ±/g, 'ر')
        .replace(/Þß/g, 'س')
        .replace(/Þ¨/g, 'ت')
        .replace(/Þ«/g, 'ع');
      
      // If still contains strange characters, fall back to English equivalent
      if (cleanTitle.includes('Þ')) {
        if (sectionTitle.toLowerCase().includes('civil') || sectionTitle.toLowerCase().includes('infrastructure')) {
          cleanTitle = 'Civil Infrastructure';
        } else if (sectionTitle.toLowerCase().includes('professional') || sectionTitle.toLowerCase().includes('service')) {
          cleanTitle = 'Professional Services & Integration';
        } else {
          cleanTitle = sectionTitle.replace(/[^\x20-\x7E]/g, '');
        }
      }
    } else {
      // Remove non-printable characters but keep basic ASCII
      cleanTitle = sectionTitle.replace(/[^\x20-\x7E]/g, '');
    }
  } catch (error) {
    console.warn('Error cleaning section title:', error);
    cleanTitle = sectionTitle.replace(/[^\x20-\x7E]/g, '');
  }
  
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
