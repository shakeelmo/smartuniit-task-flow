
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { formatDate } from '../helpers';

export const addCustomerDetails = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Prepared for:', PDF_CONFIG.pageMargin, yPosition);

  pdf.text(`Date prepared: ${formatDate(quotationData.date)}`, pageWidth - 90, yPosition);

  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(quotationData.customer.companyName || 'N/A', PDF_CONFIG.pageMargin, yPosition);

  pdf.text(`Valid until: ${formatDate(quotationData.validUntil)}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(quotationData.customer.contactName || 'N/A', PDF_CONFIG.pageMargin, yPosition);
  pdf.text(`Quotation number: ${quotationData.number}`, pageWidth - 90, yPosition);

  yPosition += 6;
  pdf.text(quotationData.customer.phone || 'N/A', PDF_CONFIG.pageMargin, yPosition);

  return yPosition + 25;
};
