import jsPDF from 'jspdf';
import { fetchImageBase64, fireToast } from './helpers';
import { COLORS, PDF_CONFIG } from './constants';
import { addTextWithWrapping } from './helpers';
import { addTableOfContents, generateTOCEntries } from './tableOfContents';

interface ProposalData {
  title: string;
  project_name?: string;
  client_company_name?: string;
  client_contact_person?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  company_name?: string;
  company_contact_details?: string;
  reference_number?: string;
  submission_date?: string;
  executive_summary?: string;
  key_objectives?: string;
  why_choose_us?: string;
  problem_description?: string;
  background_context?: string;
  proposed_solution?: string;
  strategy_method?: string;
  company_bio?: string;
  terms_conditions?: string;
  call_to_action?: string;
  quotation_data?: any;
  customer_logo_url?: string;
  table_of_contents?: boolean;
}

// Helper function to sanitize text for PDF export
const sanitizeTextForPDF = (text: string): string => {
  if (!text) return '';
  
  // Remove problematic Unicode characters and replace with safe alternatives
  return text
    .replace(/[\u0600-\u06FF]/g, '') // Remove Arabic characters temporarily for PDF compatibility
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[""'']/g, '"') // Replace smart quotes
    .replace(/[—–]/g, '-') // Replace em/en dashes
    .replace(/…/g, '...') // Replace ellipsis
    .trim();
};

// Helper function to create bilingual text that's PDF-safe
const createBilingualText = (english: string, arabic: string = ''): string => {
  const cleanEnglish = sanitizeTextForPDF(english);
  // For now, skip Arabic in PDF until we can add proper font support
  return cleanEnglish;
};

const addProposalHeader = (pdf: jsPDF, proposalData: ProposalData, logoBase64: string | null, customerLogoBase64: string | null, pageNumber: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin;

  // Blue triangular design in top-left corner
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.triangle(0, 0, 40, 0, 0, 25, 'F');

  // SmartUniverse logo in top-right (always show)
  if (logoBase64) {
    try {
      console.log('Adding SmartUniverse logo to header');
      pdf.addImage(
        logoBase64,
        'PNG',
        pageWidth - PDF_CONFIG.logoSize - PDF_CONFIG.pageMargin,
        yPosition,
        PDF_CONFIG.logoSize,
        PDF_CONFIG.logoSize
      );
    } catch (error) {
      console.log('Error adding SmartUniverse logo, using text fallback:', error);
      // Text fallback for SmartUniverse
      pdf.setTextColor(...COLORS.orange);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.title);
      pdf.text('SMART', pageWidth - 35, yPosition + 8);
      pdf.setTextColor(...COLORS.headerBlue);
      pdf.text('UNIVERSE', pageWidth - 35, yPosition + 16);
    }
  } else {
    // Text fallback for SmartUniverse
    pdf.setTextColor(...COLORS.orange);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.title);
    pdf.text('SMART', pageWidth - 35, yPosition + 8);
    pdf.setTextColor(...COLORS.headerBlue);
    pdf.text('UNIVERSE', pageWidth - 35, yPosition + 16);
  }

  // Customer logo in top-left area (if provided and it's the first page)
  if (customerLogoBase64 && pageNumber === 1) {
    try {
      console.log('Adding customer logo to header');
      pdf.addImage(
        customerLogoBase64,
        'PNG',
        45,
        yPosition,
        PDF_CONFIG.logoSize,
        PDF_CONFIG.logoSize
      );
    } catch (error) {
      console.log('Error adding customer logo to header:', error);
    }
  }

  yPosition += 35;

  // Header text for subsequent pages
  if (pageNumber > 1) {
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.large);
    pdf.text('Business Proposal (Continued)', PDF_CONFIG.pageMargin, yPosition);
    
    if (proposalData.reference_number) {
      const refText = `Ref: ${sanitizeTextForPDF(proposalData.reference_number)}`;
      const textWidth = pdf.getTextWidth(refText);
      pdf.text(refText, pageWidth - PDF_CONFIG.pageMargin - textWidth, yPosition);
    }
    yPosition += 15;
  }

  return yPosition;
};

const addProposalFooter = (pdf: jsPDF, pageNumber: number, totalPages: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
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
  pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 30, footerY);
};

const addCoverPage = (pdf: jsPDF, proposalData: ProposalData, customerLogoBase64: string | null) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 80;

  // Customer logo at the top if available
  if (customerLogoBase64) {
    try {
      console.log('Adding customer logo to cover page');
      pdf.addImage(
        customerLogoBase64,
        'PNG',
        (pageWidth - 60) / 2, // Center the logo
        yPosition - 50,
        60, // Slightly larger for cover page
        50
      );
      yPosition += 30;
    } catch (error) {
      console.log('Error adding customer logo to cover:', error);
    }
  }

  // Title
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.headerBlue);
  const sanitizedTitle = sanitizeTextForPDF(proposalData.title || 'Business Proposal');
  const titleLines = pdf.splitTextToSize(sanitizedTitle, pageWidth - 60);
  titleLines.forEach((line: string, index: number) => {
    pdf.text(line, pageWidth / 2, yPosition + (index * 12), { align: 'center' });
  });
  
  yPosition += (titleLines.length * 12) + 20;

  // Project name
  if (proposalData.project_name) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.black);
    const sanitizedProjectName = sanitizeTextForPDF(proposalData.project_name);
    pdf.text(sanitizedProjectName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;
  }

  // Client information
  if (proposalData.client_company_name) {
    pdf.setFontSize(16);
    pdf.setTextColor(...COLORS.headerBlue);
    const sanitizedClientName = sanitizeTextForPDF(proposalData.client_company_name);
    pdf.text(`Prepared for: ${sanitizedClientName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Company information
  if (proposalData.company_name) {
    pdf.setTextColor(...COLORS.black);
    const sanitizedCompanyName = sanitizeTextForPDF(proposalData.company_name);
    pdf.text(`Prepared by: ${sanitizedCompanyName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Date
  if (proposalData.submission_date) {
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.black);
    const date = new Date(proposalData.submission_date).toLocaleDateString();
    pdf.text(date, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;
  }

  // Reference number
  if (proposalData.reference_number) {
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.black);
    const sanitizedRefNumber = sanitizeTextForPDF(proposalData.reference_number);
    pdf.text(`Reference: ${sanitizedRefNumber}`, pageWidth / 2, yPosition, { align: 'center' });
  }
};

const addSectionHeader = (pdf: jsPDF, title: string, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header background
  pdf.setFillColor(...COLORS.headerBlue);
  pdf.rect(PDF_CONFIG.pageMargin, yPosition - 5, pageWidth - 2 * PDF_CONFIG.pageMargin, 12, 'F');
  
  // Section title
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.large);
  const sanitizedTitle = sanitizeTextForPDF(title);
  pdf.text(sanitizedTitle, PDF_CONFIG.pageMargin + 5, yPosition + 3);
  
  return yPosition + 15;
};

const checkPageBreak = (pdf: jsPDF, yPosition: number, requiredSpace: number, proposalData: ProposalData, logoBase64: string | null, customerLogoBase64: string | null) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (yPosition + requiredSpace > pageHeight - 50) {
    pdf.addPage();
    const pageNumber = pdf.internal.pages.length - 1;
    return addProposalHeader(pdf, proposalData, logoBase64, customerLogoBase64, pageNumber);
  }
  return yPosition;
};

const addQuotationSection = (pdf: jsPDF, quotationData: any, yPosition: number, proposalData: ProposalData, logoBase64: string | null, customerLogoBase64: string | null) => {
  if (!quotationData || !quotationData.items || quotationData.items.length === 0) {
    return yPosition;
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  yPosition = addSectionHeader(pdf, createBilingualText('Quotation', 'عرض الأسعار'), yPosition);
  yPosition += 10;

  // Quotation details
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  
  const quotationDetails = [];
  if (quotationData.quotationNumber) {
    quotationDetails.push(`Quote Number: ${sanitizeTextForPDF(quotationData.quotationNumber)}`);
  }
  if (quotationData.validUntil) {
    quotationDetails.push(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`);
  }
  if (quotationData.currency) {
    quotationDetails.push(`Currency: ${quotationData.currency}`);
  }
  
  quotationDetails.forEach(detail => {
    yPosition = checkPageBreak(pdf, yPosition, 10, proposalData, logoBase64, customerLogoBase64);
    pdf.text(detail, PDF_CONFIG.pageMargin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;

  // Table header
  yPosition = checkPageBreak(pdf, yPosition, 30, proposalData, logoBase64, customerLogoBase64);
  
  const tableStartY = yPosition;
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  const columnWidths = [85, 20, 30, 35]; // Description, Qty, Unit Price, Total
  
  // Table header background
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, tableStartY, tableWidth, 12, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  let currentX = PDF_CONFIG.pageMargin + 2;
  const headers = [
    'Description',
    'Qty',
    `Unit Price (${quotationData.currency})`,
    `Total (${quotationData.currency})`
  ];
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, tableStartY + 7);
    currentX += columnWidths[index];
  });
  
  yPosition += 12;

  // Table rows
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  
  quotationData.items.forEach((item: any, index: number) => {
    yPosition = checkPageBreak(pdf, yPosition, 20, proposalData, logoBase64, customerLogoBase64);
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, 20, 'F');
    }
    
    currentX = PDF_CONFIG.pageMargin + 2;
    
    // Description (sanitized and with text wrapping)
    const sanitizedDescription = sanitizeTextForPDF(item.description || '');
    const descriptionLines = pdf.splitTextToSize(sanitizedDescription, columnWidths[0] - 5);
    let lineY = yPosition + 5;
    descriptionLines.slice(0, 3).forEach((line: string) => { // Limit to 3 lines
      pdf.text(line, currentX, lineY);
      lineY += 4;
    });
    currentX += columnWidths[0];
    
    // Quantity
    pdf.text((Number(item.quantity) || 0).toString(), currentX, yPosition + 7);
    currentX += columnWidths[1];
    
    // Unit Price with comma formatting
    const unitPrice = Number(item.unitPrice) || 0;
    pdf.text(unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), currentX, yPosition + 7);
    currentX += columnWidths[2];
    
    // Total with comma formatting
    pdf.setFont('helvetica', 'bold');
    const total = Number(item.total) || 0;
    pdf.text(total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), currentX, yPosition + 7);
    pdf.setFont('helvetica', 'normal');
    
    yPosition += 20;
  });

  // Enhanced Totals section with proper VAT calculation and comma formatting
  yPosition += 10;
  yPosition = checkPageBreak(pdf, yPosition, 100, proposalData, logoBase64, customerLogoBase64);
  
  const totalsStartX = pageWidth - 100;
  
  // Background for totals
  pdf.setFillColor(245, 245, 245);
  pdf.rect(totalsStartX - 10, yPosition - 5, 110, 90, 'F');
  
  // Calculate proper financial values
  const subtotal = Number(quotationData.subtotal) || 0;
  const discountAmount = Number(quotationData.discountAmount) || 0;
  const afterDiscount = subtotal - discountAmount;
  
  // VAT calculation (15% of after discount amount)
  const vatRate = 0.15; // 15% VAT
  const vatAmount = afterDiscount * vatRate;
  const grandTotal = afterDiscount + vatAmount;
  
  // Helper function for formatting numbers with commas
  const formatAmount = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Display calculations
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.black);
  pdf.text('Subtotal:', totalsStartX, yPosition);
  pdf.text(`${quotationData.currency} ${formatAmount(subtotal)}`, totalsStartX + 50, yPosition);
  yPosition += 10;
  
  if (discountAmount > 0) {
    pdf.setTextColor(...COLORS.black);
    pdf.text('Discount:', totalsStartX, yPosition);
    pdf.text(`-${quotationData.currency} ${formatAmount(discountAmount)}`, totalsStartX + 50, yPosition);
    yPosition += 10;
    
    pdf.text('After Discount:', totalsStartX, yPosition);
    pdf.text(`${quotationData.currency} ${formatAmount(afterDiscount)}`, totalsStartX + 50, yPosition);
    yPosition += 10;
  }
  
  // VAT (always show, even if 0)
  pdf.text('VAT (15%):', totalsStartX, yPosition);
  pdf.text(`${quotationData.currency} ${formatAmount(vatAmount)}`, totalsStartX + 50, yPosition);
  yPosition += 10;
  
  // Grand total
  yPosition += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.setTextColor(...COLORS.headerBlue);
  pdf.text('Grand Total:', totalsStartX, yPosition);
  pdf.text(`${quotationData.currency} ${formatAmount(grandTotal)}`, totalsStartX + 50, yPosition);
  
  // Terms and notes
  yPosition += 20;
  if (quotationData.terms) {
    yPosition = checkPageBreak(pdf, yPosition, 30, proposalData, logoBase64, customerLogoBase64);
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.normal);
    pdf.text('Payment Terms:', PDF_CONFIG.pageMargin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    const sanitizedTerms = sanitizeTextForPDF(quotationData.terms);
    yPosition = addTextWithWrapping(pdf, sanitizedTerms, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 5);
    yPosition += 10;
  }
  
  if (quotationData.notes) {
    yPosition = checkPageBreak(pdf, yPosition, 30, proposalData, logoBase64, customerLogoBase64);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.normal);
    pdf.text('Notes:', PDF_CONFIG.pageMargin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    const sanitizedNotes = sanitizeTextForPDF(quotationData.notes);
    yPosition = addTextWithWrapping(pdf, sanitizedNotes, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 5);
    yPosition += 10;
  }
  
  return yPosition + 20;
};

export const generateEnhancedProposalPDF = async (proposal: ProposalData) => {
  try {
    fireToast('Generating PDF...', 'Please wait while we create your professional proposal');
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = PDF_CONFIG.pageMargin;

    // Always try to fetch SmartUniverse logo
    let logoBase64: string | null = null;
    try {
      console.log('Attempting to fetch SmartUniverse logo...');
      logoBase64 = await fetchImageBase64('/lovable-uploads/7a5c909f-0a1b-464c-9ae5-87fb578584b4.png');
      console.log('SmartUniverse logo loaded successfully');
    } catch (error) {
      console.log('SmartUniverse logo not found, will use text fallback:', error);
    }

    // Fetch customer logo if provided
    let customerLogoBase64: string | null = null;
    if (proposal.customer_logo_url) {
      try {
        console.log('Attempting to fetch customer logo:', proposal.customer_logo_url);
        
        // Check if it's a base64 string
        if (proposal.customer_logo_url.startsWith('data:image/')) {
          customerLogoBase64 = proposal.customer_logo_url;
          console.log('Using base64 customer logo directly');
        } else {
          // Try to fetch as URL
          customerLogoBase64 = await fetchImageBase64(proposal.customer_logo_url);
          console.log('Customer logo fetched successfully from URL');
        }
      } catch (error) {
        console.log('Customer logo not found or failed to load:', error);
      }
    }

    // Add header to first page
    yPosition = addProposalHeader(pdf, proposal, logoBase64, customerLogoBase64, 1);

    // Cover page
    addCoverPage(pdf, proposal, customerLogoBase64);

    // Add Table of Contents if enabled
    if (proposal.table_of_contents) {
      const tocEntries = generateTOCEntries(proposal);
      addTableOfContents(pdf, tocEntries);
    }

    // Start content on new page
    pdf.addPage();
    const contentPageNumber = proposal.table_of_contents ? 3 : 2;
    yPosition = addProposalHeader(pdf, proposal, logoBase64, customerLogoBase64, contentPageNumber);

    // Executive Summary
    if (proposal.executive_summary) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64, customerLogoBase64);
      yPosition = addSectionHeader(pdf, 'Executive Summary', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      const sanitizedSummary = sanitizeTextForPDF(proposal.executive_summary);
      yPosition = addTextWithWrapping(pdf, sanitizedSummary, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;

      if (proposal.key_objectives) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64, customerLogoBase64);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.large);
        pdf.text('Key Objectives', PDF_CONFIG.pageMargin, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.key_objectives, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 15;
      }

      if (proposal.why_choose_us) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64, customerLogoBase64);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.large);
        pdf.text('Why Choose Us', PDF_CONFIG.pageMargin, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.why_choose_us, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 15;
      }
    }

    // Problem Statement
    if (proposal.problem_description || proposal.background_context) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64, customerLogoBase64);
      yPosition = addSectionHeader(pdf, 'Problem Statement', yPosition);

      if (proposal.problem_description) {
        pdf.setTextColor(...COLORS.black);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        const sanitizedProblem = sanitizeTextForPDF(proposal.problem_description);
        yPosition = addTextWithWrapping(pdf, sanitizedProblem, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 10;
      }

      if (proposal.background_context) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64, customerLogoBase64);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.large);
        pdf.text('Background Context', PDF_CONFIG.pageMargin, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.background_context, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 15;
      }
    }

    // Approach & Solution
    if (proposal.proposed_solution || proposal.strategy_method) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64, customerLogoBase64);
      yPosition = addSectionHeader(pdf, 'Approach & Solution', yPosition);

      if (proposal.proposed_solution) {
        pdf.setTextColor(...COLORS.black);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        const sanitizedSolution = sanitizeTextForPDF(proposal.proposed_solution);
        yPosition = addTextWithWrapping(pdf, sanitizedSolution, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 10;
      }

      if (proposal.strategy_method) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64, customerLogoBase64);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(PDF_CONFIG.fontSize.large);
        pdf.text('Strategy & Method', PDF_CONFIG.pageMargin, yPosition);
        yPosition += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.strategy_method, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 15;
      }
    }

    // Quotation Section (Enhanced and always included if exists)
    if (proposal.quotation_data) {
      yPosition = checkPageBreak(pdf, yPosition, 60, proposal, logoBase64, customerLogoBase64);
      yPosition = addQuotationSection(pdf, proposal.quotation_data, yPosition, proposal, logoBase64, customerLogoBase64);
    }

    // About Us
    if (proposal.company_bio) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64, customerLogoBase64);
      yPosition = addSectionHeader(pdf, 'About Us', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      const sanitizedBio = sanitizeTextForPDF(proposal.company_bio);
      yPosition = addTextWithWrapping(pdf, sanitizedBio, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;
    }

    // Terms & Conditions
    if (proposal.terms_conditions) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64, customerLogoBase64);
      yPosition = addSectionHeader(pdf, 'Terms & Conditions', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      const sanitizedTerms = sanitizeTextForPDF(proposal.terms_conditions);
      yPosition = addTextWithWrapping(pdf, sanitizedTerms, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;
    }

    // Call to Action
    if (proposal.call_to_action) {
      yPosition = checkPageBreak(pdf, yPosition, 50, proposal, logoBase64, customerLogoBase64);
      
      // CTA background
      pdf.setFillColor(...COLORS.headerBlue);
      pdf.rect(PDF_CONFIG.pageMargin, yPosition - 5, pageWidth - 2 * PDF_CONFIG.pageMargin, 40, 'F');
      
      pdf.setTextColor(...COLORS.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.title);
      pdf.text('Ready to Get Started?', pageWidth / 2, yPosition + 10, { align: 'center' });
      
      pdf.setFontSize(PDF_CONFIG.fontSize.large);
      pdf.setFont('helvetica', 'normal');
      const sanitizedCTA = sanitizeTextForPDF(proposal.call_to_action);
      pdf.text(sanitizedCTA, pageWidth / 2, yPosition + 20, { align: 'center' });

      if (proposal.company_contact_details) {
        pdf.setFontSize(PDF_CONFIG.fontSize.small);
        const sanitizedContact = sanitizeTextForPDF(proposal.company_contact_details);
        const contactLines = pdf.splitTextToSize(sanitizedContact, pageWidth - 2 * PDF_CONFIG.pageMargin);
        contactLines.forEach((line: string, index: number) => {
          pdf.text(line, pageWidth / 2, yPosition + 28 + (index * 4), { align: 'center' });
        });
      }
      
      yPosition += 45;
    }

    // Add footers to all pages
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addProposalFooter(pdf, i, totalPages);
    }

    // Save the PDF
    const sanitizedTitle = sanitizeTextForPDF(proposal.title || 'proposal');
    const fileName = `${sanitizedTitle.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    fireToast('Success', 'Professional proposal PDF generated successfully with logos and table of contents');
    
  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    fireToast('Error', 'Failed to generate proposal PDF', 'destructive');
    throw error;
  }
};
