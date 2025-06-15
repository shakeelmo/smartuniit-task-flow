
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';

export const addTitleBar = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 12, 'F');
  pdf.setTextColor(...COLORS.orange);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  // Always use "Quotation" as the title instead of the company name:
  const titleText = 'Quotation';
  const titleWidth = pdf.getTextWidth(titleText);
  pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition + 8);

  return yPosition + 20;
};
