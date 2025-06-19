import jsPDF from 'jspdf';

export const generateProposalPDF = async (proposal: any) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Cover Page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(proposal.title || 'Business Proposal', pageWidth - (margin * 2));
  pdf.text(titleLines, pageWidth / 2, 60, { align: 'center' });
  
  yPosition = 80 + (titleLines.length * 10);

  if (proposal.project_name) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.text(proposal.project_name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
  }

  if (proposal.client_company_name) {
    pdf.setFontSize(14);
    pdf.text(`Prepared for: ${proposal.client_company_name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  if (proposal.company_name) {
    pdf.text(`Prepared by: ${proposal.company_name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  if (proposal.submission_date) {
    pdf.setFontSize(12);
    const date = new Date(proposal.submission_date).toLocaleDateString();
    pdf.text(date, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  if (proposal.reference_number) {
    pdf.setFontSize(10);
    pdf.text(`Reference: ${proposal.reference_number}`, pageWidth / 2, yPosition, { align: 'center' });
  }

  // New page for content
  pdf.addPage();
  yPosition = margin;

  // Table of Contents (if needed)
  const sections = [];
  if (proposal.executive_summary) sections.push('Executive Summary');
  if (proposal.problem_description || proposal.background_context) sections.push('Problem Statement');
  if (proposal.proposed_solution || proposal.strategy_method) sections.push('Approach & Solution');
  if (proposal.company_bio) sections.push('About Us');
  if (proposal.terms_conditions) sections.push('Terms & Conditions');

  if (sections.length > 0) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Table of Contents', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    sections.forEach((section, index) => {
      pdf.text(`${index + 1}. ${section}`, margin + 5, yPosition);
      yPosition += 8;
    });

    pdf.addPage();
    yPosition = margin;
  }

  // Executive Summary
  if (proposal.executive_summary) {
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 15;

    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(proposal.executive_summary, margin, yPosition, pageWidth - (margin * 2));
    yPosition += 10;

    if (proposal.key_objectives) {
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Objectives', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.key_objectives, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 10;
    }

    if (proposal.why_choose_us) {
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Why Choose Us', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.why_choose_us, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 15;
    }
  }

  // Problem Statement
  if (proposal.problem_description || proposal.background_context) {
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Problem Statement', margin, yPosition);
    yPosition += 15;

    if (proposal.problem_description) {
      pdf.setFontSize(14);
      pdf.text('Problem Description', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.problem_description, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 10;
    }

    if (proposal.background_context) {
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Background Context', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.background_context, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 15;
    }
  }

  // Approach & Solution
  if (proposal.proposed_solution || proposal.strategy_method) {
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Approach & Solution', margin, yPosition);
    yPosition += 15;

    if (proposal.proposed_solution) {
      pdf.setFontSize(14);
      pdf.text('Proposed Solution', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.proposed_solution, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 10;
    }

    if (proposal.strategy_method) {
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Strategy & Method', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      yPosition = addWrappedText(proposal.strategy_method, margin, yPosition, pageWidth - (margin * 2));
      yPosition += 15;
    }
  }

  // About Us
  if (proposal.company_bio) {
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('About Us', margin, yPosition);
    yPosition += 15;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    yPosition = addWrappedText(proposal.company_bio, margin, yPosition, pageWidth - (margin * 2));
    yPosition += 15;
  }

  // Terms & Conditions
  if (proposal.terms_conditions) {
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Terms & Conditions', margin, yPosition);
    yPosition += 15;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    yPosition = addWrappedText(proposal.terms_conditions, margin, yPosition, pageWidth - (margin * 2));
    yPosition += 15;
  }

  // Call to Action
  if (proposal.call_to_action) {
    checkPageBreak(40);
    pdf.setFillColor(25, 95, 53); // Primary color
    pdf.rect(margin - 5, yPosition - 5, pageWidth - (margin * 2) + 10, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ready to Get Started?', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(proposal.call_to_action, pageWidth / 2, yPosition + 20, { align: 'center' });

    if (proposal.company_contact_details) {
      pdf.setFontSize(10);
      const contactLines = pdf.splitTextToSize(proposal.company_contact_details, pageWidth - (margin * 2));
      pdf.text(contactLines, pageWidth / 2, yPosition + 30, { align: 'center' });
    }
  }

  // Save the PDF
  const fileName = `${proposal.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'proposal'}_${Date.now()}.pdf`;
  pdf.save(fileName);
};

// Re-export the enhanced version as the main export
export { generateEnhancedProposalPDF as generateProposalPDF } from './pdf/proposalPdfExport';
