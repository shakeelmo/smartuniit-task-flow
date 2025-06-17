
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { addTextWithWrapping } from '../helpers';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 40; // Space reserved for footer

export const addTermsAndBanking = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  // Calculate approximate space needed for terms and banking section
  const termLines = quotationData.customTerms.split('\n');
  const termsHeight = termLines.length * 6 + 20; // Approximate height calculation
  
  // Check if we need a new page for terms section
  if (currentY + termsHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    currentY = addPageHeader(pdf, quotationData);
  }

  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Terms and conditions', PDF_CONFIG.pageMargin, currentY);
  pdf.text('Banking Details', pageWidth - 90, currentY);

  currentY += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  termLines.forEach(term => {
    if (term.trim()) {
      // Check if we need a new page for this term
      if (currentY + PDF_CONFIG.lineHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
        pdf.addPage();
        currentY = addPageHeader(pdf, quotationData);
        
        // Re-add section headers on new page
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.large);
        pdf.text('Terms and conditions (Continued)', PDF_CONFIG.pageMargin, currentY);
        pdf.text('Banking Details', pageWidth - 90, currentY);
        currentY += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.small);
      }
      
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

  // Banking details (right side) - calculate position based on terms height
  let bankingY = yPosition + 10;
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  
  const bankingDetails = [
    'Smart Universe Communication and Information Technology.',
    'Bank Name: Saudi National Bank',
    'IBAN: SA3610000041000000080109',
    'Account Number: 41000000080109'
  ];

  bankingDetails.forEach(detail => {
    // Check if banking detail fits on current page
    if (bankingY + PDF_CONFIG.lineHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      bankingY = addPageHeader(pdf, quotationData);
      
      // Re-add banking header on new page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.large);
      pdf.text('Banking Details (Continued)', pageWidth - 90, bankingY);
      bankingY += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.small);
    }
    
    bankingY = addTextWithWrapping(pdf, detail, pageWidth - 88, bankingY, 85, PDF_CONFIG.lineHeight);
    bankingY += 2;
  });

  return Math.max(currentY, bankingY) + 15;
};

const addPageHeader = (pdf: jsPDF, quotationData: QuotationData): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Add basic header info on continuation pages
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Quotation (Continued)', PDF_CONFIG.pageMargin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text(`Quote: ${quotationData.number}`, pageWidth - 80, yPosition);
  
  yPosition += 10;
  pdf.text(`Customer: ${quotationData.customer.companyName}`, PDF_CONFIG.pageMargin, yPosition);
  
  return yPosition + 15;
};
