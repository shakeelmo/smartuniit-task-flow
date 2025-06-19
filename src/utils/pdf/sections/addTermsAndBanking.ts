import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { addTextWithWrapping } from '../helpers';

const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_MARGIN = 50; // Increased space reserved for footer

export const addTermsAndBanking = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let currentY = yPosition;

  // Check if we have enough space for the section headers
  if (currentY + 25 > PAGE_HEIGHT - BOTTOM_MARGIN) {
    pdf.addPage();
    currentY = addPageHeader(pdf, quotationData);
  }

  // Section headers
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  pdf.text('Terms and conditions', PDF_CONFIG.pageMargin, currentY);
  pdf.text('Banking Details', pageWidth - 100, currentY);

  currentY += 10;

  // Process terms and banking in parallel to avoid extra pages
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);

  const termLines = quotationData.customTerms.split('\n').filter(line => line.trim());
  const bankingDetails = [
    'Smart Universe Communication and Information Technology.',
    'Bank Name: Saudi National Bank',
    'IBAN: SA3610000041000000080109',
    'Account Number: 41000000080109'
  ];

  // Calculate the maximum number of lines we can fit on current page
  const availableSpace = (PAGE_HEIGHT - BOTTOM_MARGIN) - currentY;
  const linesPerPage = Math.floor(availableSpace / PDF_CONFIG.lineHeight);
  
  let termsY = currentY;
  let bankingY = currentY;
  
  // Process terms (left side)
  termLines.forEach((term, index) => {
    // Check if we need a new page
    if (termsY + PDF_CONFIG.lineHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      const newY = addPageHeader(pdf, quotationData);
      
      // Re-add section headers on new page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.large);
      pdf.text('Terms and conditions (Continued)', PDF_CONFIG.pageMargin, newY);
      pdf.text('Banking Details (Continued)', pageWidth - 100, newY);
      
      termsY = newY + 10;
      bankingY = newY + 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.small);
    }
    
    if (term.trim()) {
      const processedTerm = term.startsWith('•') ? term : `• ${term}`;
      termsY = addTextWithWrapping(
        pdf,
        processedTerm,
        PDF_CONFIG.pageMargin + 2,
        termsY,
        pageWidth - 130, // Leave more space for banking details
        PDF_CONFIG.lineHeight
      );
      termsY += 1;
    }
  });

  // Process banking details (right side) - reset to original position
  bankingY = currentY;
  bankingDetails.forEach((detail, index) => {
    // Check if banking detail fits on current page
    if (bankingY + PDF_CONFIG.lineHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      // If we're on a new page, adjust banking position accordingly
      const totalPages = pdf.internal.pages.length - 1; // Get current page count
      
      // Find the right Y position on the current page
      bankingY = PDF_CONFIG.pageMargin + 25; // Standard position after headers
    }
    
    bankingY = addTextWithWrapping(
      pdf, 
      detail, 
      pageWidth - 98, // Fixed right alignment
      bankingY, 
      95, // Fixed width for banking section
      PDF_CONFIG.lineHeight
    );
    bankingY += 2;
  });

  // Return the maximum Y position to ensure proper spacing
  return Math.max(termsY, bankingY) + 10;
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
