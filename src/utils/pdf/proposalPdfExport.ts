
import jsPDF from 'jspdf';
import { fetchImageBase64, fireToast } from './helpers';
import { COLORS, PDF_CONFIG } from './constants';
import { addTextWithWrapping } from './helpers';

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
}

const addProposalHeader = (pdf: jsPDF, proposalData: ProposalData, logoBase64: string | null, pageNumber: number) => {
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

  // Header text for subsequent pages
  if (pageNumber > 1) {
    pdf.setTextColor(...COLORS.black);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSize.large);
    pdf.text('Business Proposal (Continued)', PDF_CONFIG.pageMargin, yPosition);
    
    if (proposalData.reference_number) {
      const refText = `Ref: ${proposalData.reference_number}`;
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

const addCoverPage = (pdf: jsPDF, proposalData: ProposalData) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 80;

  // Title
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.headerBlue);
  const titleLines = pdf.splitTextToSize(proposalData.title || 'Business Proposal', pageWidth - 60);
  titleLines.forEach((line: string, index: number) => {
    pdf.text(line, pageWidth / 2, yPosition + (index * 12), { align: 'center' });
  });
  
  yPosition += (titleLines.length * 12) + 20;

  // Project name
  if (proposalData.project_name) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.black);
    pdf.text(proposalData.project_name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;
  }

  // Client information
  if (proposalData.client_company_name) {
    pdf.setFontSize(16);
    pdf.setTextColor(...COLORS.headerBlue);
    pdf.text(`Prepared for: ${proposalData.client_company_name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Company information
  if (proposalData.company_name) {
    pdf.setTextColor(...COLORS.black);
    pdf.text(`Prepared by: ${proposalData.company_name}`, pageWidth / 2, yPosition, { align: 'center' });
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
    pdf.text(`Reference: ${proposalData.reference_number}`, pageWidth / 2, yPosition, { align: 'center' });
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
  pdf.text(title, PDF_CONFIG.pageMargin + 5, yPosition + 3);
  
  return yPosition + 15;
};

const checkPageBreak = (pdf: jsPDF, yPosition: number, requiredSpace: number, proposalData: ProposalData, logoBase64: string | null) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (yPosition + requiredSpace > pageHeight - 50) {
    pdf.addPage();
    const pageNumber = pdf.internal.pages.length - 1;
    return addProposalHeader(pdf, proposalData, logoBase64, pageNumber);
  }
  return yPosition;
};

const addQuotationSection = (pdf: jsPDF, quotationData: any, yPosition: number, proposalData: ProposalData, logoBase64: string | null) => {
  if (!quotationData || !quotationData.items || quotationData.items.length === 0) {
    return yPosition;
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  yPosition = addSectionHeader(pdf, 'Quotation', yPosition);
  yPosition += 10;

  // Quotation details
  pdf.setTextColor(...COLORS.black);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  
  const quotationDetails = [];
  if (quotationData.quotationNumber) quotationDetails.push(`Quote Number: ${quotationData.quotationNumber}`);
  if (quotationData.validUntil) quotationDetails.push(`Valid Until: ${new Date(quotationData.validUntil).toLocaleDateString()}`);
  if (quotationData.currency) quotationDetails.push(`Currency: ${quotationData.currency}`);
  
  quotationDetails.forEach(detail => {
    pdf.text(detail, PDF_CONFIG.pageMargin, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;

  // Table header
  yPosition = checkPageBreak(pdf, yPosition, 30, proposalData, logoBase64);
  
  const tableStartY = yPosition;
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;
  const columnWidths = [80, 20, 30, 35]; // Description, Qty, Unit Price, Total
  
  // Table header background
  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, tableStartY, tableWidth, 12, 'F');
  
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);
  
  let currentX = PDF_CONFIG.pageMargin + 2;
  const headers = ['Description', 'Quantity', `Unit Price (${quotationData.currency})`, `Total (${quotationData.currency})`];
  
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
    yPosition = checkPageBreak(pdf, yPosition, 12, proposalData, logoBase64);
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.lightGray);
      pdf.rect(PDF_CONFIG.pageMargin, yPosition, tableWidth, 12, 'F');
    }
    
    currentX = PDF_CONFIG.pageMargin + 2;
    
    // Description
    const description = item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description;
    pdf.text(description, currentX, yPosition + 7);
    currentX += columnWidths[0];
    
    // Quantity
    pdf.text(item.quantity.toString(), currentX, yPosition + 7);
    currentX += columnWidths[1];
    
    // Unit Price
    pdf.text(item.unitPrice.toFixed(2), currentX, yPosition + 7);
    currentX += columnWidths[2];
    
    // Total
    pdf.text(item.total.toFixed(2), currentX, yPosition + 7);
    
    yPosition += 12;
  });

  // Totals section
  yPosition += 5;
  yPosition = checkPageBreak(pdf, yPosition, 60, proposalData, logoBase64);
  
  const totalsStartX = pageWidth - 100;
  
  if (quotationData.subtotal) {
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', totalsStartX, yPosition);
    pdf.text(`${quotationData.currency} ${quotationData.subtotal.toFixed(2)}`, totalsStartX + 40, yPosition);
    yPosition += 8;
  }
  
  if (quotationData.discountAmount && quotationData.discountAmount > 0) {
    pdf.setTextColor(...COLORS.black);
    pdf.text('Discount:', totalsStartX, yPosition);
    pdf.text(`-${quotationData.currency} ${quotationData.discountAmount.toFixed(2)}`, totalsStartX + 40, yPosition);
    yPosition += 8;
  }
  
  if (quotationData.taxAmount && quotationData.taxAmount > 0) {
    pdf.text('Tax:', totalsStartX, yPosition);
    pdf.text(`${quotationData.currency} ${quotationData.taxAmount.toFixed(2)}`, totalsStartX + 40, yPosition);
    yPosition += 8;
  }
  
  // Grand total
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  pdf.text('Grand Total:', totalsStartX, yPosition);
  pdf.text(`${quotationData.currency} ${quotationData.grandTotal?.toFixed(2) || '0.00'}`, totalsStartX + 40, yPosition);
  
  return yPosition + 20;
};

export const generateEnhancedProposalPDF = async (proposal: ProposalData) => {
  try {
    fireToast('Generating PDF...', 'Please wait while we create your professional proposal');
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = PDF_CONFIG.pageMargin;

    // Try to fetch SmartUniverse logo
    let logoBase64: string | null = null;
    try {
      logoBase64 = await fetchImageBase64('/placeholder.svg');
    } catch (error) {
      console.log('Logo not found, proceeding without logo');
    }

    // Add header to first page
    yPosition = addProposalHeader(pdf, proposal, logoBase64, 1);

    // Cover page
    addCoverPage(pdf, proposal);

    // Start content on new page
    pdf.addPage();
    yPosition = addProposalHeader(pdf, proposal, logoBase64, 2);

    // Executive Summary
    if (proposal.executive_summary) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64);
      yPosition = addSectionHeader(pdf, 'Executive Summary', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      yPosition = addTextWithWrapping(pdf, proposal.executive_summary, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;

      if (proposal.key_objectives) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64);
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
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64);
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
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64);
      yPosition = addSectionHeader(pdf, 'Problem Statement', yPosition);

      if (proposal.problem_description) {
        pdf.setTextColor(...COLORS.black);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.problem_description, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 10;
      }

      if (proposal.background_context) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64);
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
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64);
      yPosition = addSectionHeader(pdf, 'Approach & Solution', yPosition);

      if (proposal.proposed_solution) {
        pdf.setTextColor(...COLORS.black);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(PDF_CONFIG.fontSize.medium);
        yPosition = addTextWithWrapping(pdf, proposal.proposed_solution, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
        yPosition += 10;
      }

      if (proposal.strategy_method) {
        yPosition = checkPageBreak(pdf, yPosition, 30, proposal, logoBase64);
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

    // Quotation Section (if exists)
    if (proposal.quotation_data) {
      yPosition = checkPageBreak(pdf, yPosition, 60, proposal, logoBase64);
      yPosition = addQuotationSection(pdf, proposal.quotation_data, yPosition, proposal, logoBase64);
    }

    // About Us
    if (proposal.company_bio) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64);
      yPosition = addSectionHeader(pdf, 'About Us', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      yPosition = addTextWithWrapping(pdf, proposal.company_bio, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;
    }

    // Terms & Conditions
    if (proposal.terms_conditions) {
      yPosition = checkPageBreak(pdf, yPosition, 40, proposal, logoBase64);
      yPosition = addSectionHeader(pdf, 'Terms & Conditions', yPosition);
      
      pdf.setTextColor(...COLORS.black);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.medium);
      yPosition = addTextWithWrapping(pdf, proposal.terms_conditions, PDF_CONFIG.pageMargin, yPosition, pageWidth - 2 * PDF_CONFIG.pageMargin, 6);
      yPosition += 15;
    }

    // Call to Action
    if (proposal.call_to_action) {
      yPosition = checkPageBreak(pdf, yPosition, 50, proposal, logoBase64);
      
      // CTA background
      pdf.setFillColor(...COLORS.headerBlue);
      pdf.rect(PDF_CONFIG.pageMargin, yPosition - 5, pageWidth - 2 * PDF_CONFIG.pageMargin, 40, 'F');
      
      pdf.setTextColor(...COLORS.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(PDF_CONFIG.fontSize.title);
      pdf.text('Ready to Get Started?', pageWidth / 2, yPosition + 10, { align: 'center' });
      
      pdf.setFontSize(PDF_CONFIG.fontSize.large);
      pdf.setFont('helvetica', 'normal');
      pdf.text(proposal.call_to_action, pageWidth / 2, yPosition + 20, { align: 'center' });

      if (proposal.company_contact_details) {
        pdf.setFontSize(PDF_CONFIG.fontSize.small);
        const contactLines = pdf.splitTextToSize(proposal.company_contact_details, pageWidth - 2 * PDF_CONFIG.pageMargin);
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
    const fileName = `${proposal.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'proposal'}_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    fireToast('Success', 'Professional proposal PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    fireToast('Error', 'Failed to generate proposal PDF', 'destructive');
    throw error;
  }
};
