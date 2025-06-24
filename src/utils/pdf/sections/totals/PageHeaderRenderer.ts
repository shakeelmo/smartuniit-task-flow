
import jsPDF from 'jspdf';
import { QuotationData } from '../../types';
import { COLORS, PDF_CONFIG } from '../../constants';

export const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Quotation (Continued)', PDF_CONFIG.pageMargin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(`Quote: ${quotationData.number}`, pageWidth - 80, yPosition);
  
  yPosition += 10;
  const customerName = quotationData.customer.companyName || 'Unknown Customer';
  pdf.text(`Customer: ${customerName}`, PDF_CONFIG.pageMargin, yPosition);
  
  return yPosition + 15;
};
