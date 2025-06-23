
import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from './constants';

interface TOCEntry {
  title: string;
  pageNumber: number;
  level: number; // 1 for main sections, 2 for subsections
}

export const addTableOfContents = (pdf: jsPDF, entries: TOCEntry[]) => {
  if (entries.length === 0) return;

  // Add new page for TOC
  pdf.addPage();
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = PDF_CONFIG.pageMargin + 20;

  // TOC Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.headerBlue);
  pdf.text('Table of Contents', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 30;

  // TOC Entries
  pdf.setFontSize(PDF_CONFIG.fontSize.medium);
  
  entries.forEach((entry, index) => {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPosition = PDF_CONFIG.pageMargin + 20;
    }

    const indent = entry.level === 1 ? PDF_CONFIG.pageMargin : PDF_CONFIG.pageMargin + 15;
    const fontWeight = entry.level === 1 ? 'bold' : 'normal';
    
    pdf.setFont('helvetica', fontWeight);
    pdf.setTextColor(...COLORS.black);
    
    // Entry title
    pdf.text(entry.title, indent, yPosition);
    
    // Dotted line
    const titleWidth = pdf.getTextWidth(entry.title);
    const pageNumWidth = pdf.getTextWidth(entry.pageNumber.toString());
    const dotsStartX = indent + titleWidth + 5;
    const dotsEndX = pageWidth - PDF_CONFIG.pageMargin - pageNumWidth - 5;
    
    if (dotsEndX > dotsStartX) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(PDF_CONFIG.fontSize.small);
      
      // Draw dots
      const dotSpacing = 3;
      for (let x = dotsStartX; x < dotsEndX; x += dotSpacing) {
        pdf.text('.', x, yPosition);
      }
    }
    
    // Page number
    pdf.setFont('helvetica', fontWeight);
    pdf.setFontSize(PDF_CONFIG.fontSize.medium);
    pdf.text(entry.pageNumber.toString(), pageWidth - PDF_CONFIG.pageMargin, yPosition, { align: 'right' });
    
    yPosition += entry.level === 1 ? 8 : 6;
  });
};

export const generateTOCEntries = (proposal: any): TOCEntry[] => {
  const entries: TOCEntry[] = [];
  let currentPage = 3; // Start after cover page and TOC page

  // Cover Page
  entries.push({ title: 'Cover Page', pageNumber: 1, level: 1 });
  
  // Table of Contents
  entries.push({ title: 'Table of Contents', pageNumber: 2, level: 1 });

  // Executive Summary
  if (proposal.executive_summary) {
    entries.push({ title: 'Executive Summary', pageNumber: currentPage, level: 1 });
    if (proposal.key_objectives) {
      entries.push({ title: 'Key Objectives', pageNumber: currentPage, level: 2 });
    }
    if (proposal.why_choose_us) {
      entries.push({ title: 'Why Choose Us', pageNumber: currentPage, level: 2 });
    }
    currentPage++;
  }

  // Problem Statement
  if (proposal.problem_description || proposal.background_context) {
    entries.push({ title: 'Problem Statement', pageNumber: currentPage, level: 1 });
    if (proposal.problem_description) {
      entries.push({ title: 'Problem Description', pageNumber: currentPage, level: 2 });
    }
    if (proposal.background_context) {
      entries.push({ title: 'Background Context', pageNumber: currentPage, level: 2 });
    }
    currentPage++;
  }

  // Approach & Solution
  if (proposal.proposed_solution || proposal.strategy_method) {
    entries.push({ title: 'Approach & Solution', pageNumber: currentPage, level: 1 });
    if (proposal.proposed_solution) {
      entries.push({ title: 'Proposed Solution', pageNumber: currentPage, level: 2 });
    }
    if (proposal.strategy_method) {
      entries.push({ title: 'Strategy & Method', pageNumber: currentPage, level: 2 });
    }
    currentPage++;
  }

  // Quotation
  if (proposal.quotation_data && proposal.quotation_data.items && proposal.quotation_data.items.length > 0) {
    entries.push({ title: 'Quotation', pageNumber: currentPage, level: 1 });
    currentPage++;
  }

  // About Us
  if (proposal.company_bio) {
    entries.push({ title: 'About Us', pageNumber: currentPage, level: 1 });
    currentPage++;
  }

  // Terms & Conditions
  if (proposal.terms_conditions) {
    entries.push({ title: 'Terms & Conditions', pageNumber: currentPage, level: 1 });
    currentPage++;
  }

  return entries;
};
