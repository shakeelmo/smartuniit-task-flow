
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { getCurrencyInfo, formatDate } from '../helpers';

// Original addHeader logic extracted
export const addHeader = (
  pdf: jsPDF,
  quotationData: QuotationData,
  logoBase64: string | null
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Blue triangular design in top-left corner
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.triangle(0, 0, 40, 0, 0, 25, 'F');

  // SmartUniverse logo in top-right
  if (logoBase64) {
    pdf.addImage(
      logoBase64,
      'PNG',
      pageWidth - PDF_CONFIG.logoSize - PDF_CONFIG.pageMargin,
      yPosition,
      PDF_CONFIG.logoSize,
      PDF_CONFIG.logoSize
    );
  } else {
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.title);
    pdf.text('SMART', pageWidth - 35, yPosition + 8);
    pdf.setTextColor(...COLORS.headerBlue);
    pdf.text('UNIVERSE', pageWidth - 35, yPosition + 16);
  }

  yPosition += 35;

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('VAT Registration Number: 300155266800003', PDF_CONFIG.pageMargin, yPosition);

  const quotationText = `${quotationData.number}`;
  const textWidth = pdf.getTextWidth(quotationText);
  pdf.text(quotationText, pageWidth - PDF_CONFIG.pageMargin - textWidth, yPosition);

  return yPosition + 15;
};
