
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../constants';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 40; // Space reserved for footer

export const addFooter = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array includes a null first element

  // Check if we need a new page for footer content
  if (yPosition + 30 > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    yPosition = PDF_CONFIG.pageMargin;
  }

  pdf.setTextColor(...COLORS.headerBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const endText = '***End Of Quotation***';
  const endTextWidth = pdf.getTextWidth(endText);
  pdf.text(endText, (pageWidth - endTextWidth) / 2, yPosition);

  // Add footer to all pages
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    const footerY = pageHeight - 25;

    // Blue triangular design in bottom-right
    pdf.setFillColor(...COLORS.headerBlue);
    pdf.triangle(pageWidth, pageHeight, pageWidth - 40, pageHeight, pageWidth, pageHeight - 25, 'F');

    // Contact information footer
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    const contactText = 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295';
    const contactWidth = pdf.getTextWidth(contactText);
    pdf.text(contactText, (pageWidth - contactWidth) / 2, footerY - 10);

    // Copyright and page number
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    pdf.text('Copy Right© Smart Universe for Communication & IT', PDF_CONFIG.pageMargin, footerY);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, footerY);
  }

  // Return to last page
  pdf.setPage(totalPages);
};
