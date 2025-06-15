
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { addTextWithWrapping } from '../helpers';

export const addTermsAndBanking = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Terms and conditions', PDF_CONFIG.pageMargin, currentY);
  pdf.text('Banking Details', pageWidth - 90, currentY);

  currentY += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  const termLines = quotationData.customTerms.split('\n');

  termLines.forEach(term => {
    if (term.trim()) {
      const processedTerm = term.startsWith('•') ? term : `• ${term}`;
      currentY = addTextWithWrapping(
        pdf,
        processedTerm,
        PDF_CONFIG.pageMargin + 2,
        currentY,
        pageWidth - 120,
        PDF_CONFIG.lineHeight
      );
      currentY += 1;
    }
  });

  let bankingY = currentY - termLines.length * 5;
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  bankingY = addTextWithWrapping(pdf, 'Smart Universe Communication and Information Technology.', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'Bank Name: Saudi National Bank', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'IBAN: SA3610000041000000080109', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
  bankingY += 2;
  bankingY = addTextWithWrapping(pdf, 'Account Number: 41000000080109', pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);

  return currentY + 15;
};
