
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from '../constants';

export const addFooter = (pdf: jsPDF, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setTextColor(...COLORS.headerBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  const endText = '***End Of Quotation***';
  const endTextWidth = pdf.getTextWidth(endText);
  pdf.text(endText, (pageWidth - endTextWidth) / 2, yPosition);

  yPosition += 10;

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  const addressText = 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295';
  const addressWidth = pdf.getTextWidth(addressText);
  pdf.text(addressText, (pageWidth - addressWidth) / 2, yPosition);

  const footerY = pageHeight - 30;

  pdf.setFillColor(...COLORS.headerBlue);
  pdf.triangle(pageWidth, pageHeight, pageWidth - 40, pageHeight, pageWidth, pageHeight - 25, 'F');

  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  pdf.text('Copy Right© Smart Universe for Communication & IT', PDF_CONFIG.pageMargin, footerY);
  pdf.text('Page 1 of 1', pageWidth - 25, footerY);
};
