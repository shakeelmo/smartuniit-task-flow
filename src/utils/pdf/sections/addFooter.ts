
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../constants';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 50; // Space reserved for footer

export const addFooter = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array includes a null first element

  // Calculate if we need more space for footer content
  const requiredFooterSpace = 45; // Space needed for footer content
  const footerStartY = yPosition + 20; // Add spacing before footer

  // Check if we need a new page for footer content
  if (footerStartY + requiredFooterSpace > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    yPosition = PDF_CONFIG.pageMargin;
  }

  // Ensure we have enough space by using a safer Y position
  const safeFooterY = Math.min(footerStartY, PAGE_HEIGHT - BOTTOM_MARGIN - requiredFooterSpace);

  // Add line separator before footer content
  pdf.setDrawColor(...COLORS.headerBlue);
  pdf.setLineWidth(0.5);
  pdf.line(PDF_CONFIG.pageMargin, safeFooterY, pageWidth - PDF_CONFIG.pageMargin, safeFooterY);

  // Add "End Of Quotation" text with proper spacing
  const endOfQuotationY = safeFooterY + 12;
  pdf.setTextColor(...COLORS.headerBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const endText = '***End Of Quotation***';
  const endTextWidth = pdf.getTextWidth(endText);
  pdf.text(endText, (pageWidth - endTextWidth) / 2, endOfQuotationY);

  // Get updated total pages after potential page addition
  const finalTotalPages = pdf.internal.pages.length - 1;

  // Add footer to ALL pages including any newly created ones
  for (let i = 1; i <= finalTotalPages; i++) {
    pdf.setPage(i);
    
    const footerY = pageHeight - 30; // Fixed position from bottom

    // Blue triangular design in bottom-right corner
    pdf.setFillColor(...COLORS.headerBlue);
    pdf.triangle(pageWidth, pageHeight, pageWidth - 40, pageHeight, pageWidth, pageHeight - 25, 'F');

    // Add horizontal line separator above footer
    pdf.setDrawColor(...COLORS.headerBlue);
    pdf.setLineWidth(0.3);
    pdf.line(PDF_CONFIG.pageMargin, footerY - 15, pageWidth - PDF_CONFIG.pageMargin, footerY - 15);

    // Contact information footer with proper spacing
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    const contactText = 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295';
    const contactWidth = pdf.getTextWidth(contactText);
    pdf.text(contactText, (pageWidth - contactWidth) / 2, footerY - 8);

    // Copyright and page number
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    pdf.text('Copy Right© Smart Universe for Communication & IT', PDF_CONFIG.pageMargin, footerY);
    pdf.text(`Page ${i} of ${finalTotalPages}`, pageWidth - 30, footerY);
  }

  // Return to last page
  pdf.setPage(finalTotalPages);
};
