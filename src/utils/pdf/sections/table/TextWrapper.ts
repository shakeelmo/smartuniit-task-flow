
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../../constants';

export const wrapText = (
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number = PDF_CONFIG.fontSize.normal
): string[] => {
  // Validate input parameters
  if (!text || typeof text !== 'string') {
    return [''];
  }

  if (typeof maxWidth !== 'number' || maxWidth <= 0 || isNaN(maxWidth)) {
    console.warn('Invalid maxWidth for text wrapping:', maxWidth);
    return [String(text).trim()];
  }

  pdf.setFontSize(fontSize);
  
  // Additional text cleaning to handle encoding issues
  const cleanText = String(text)
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable ASCII and Latin extended
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  if (!cleanText || cleanText.length === 0) {
    return [''];
  }

  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    let testWidth;
    try {
      testWidth = pdf.getTextWidth(testLine);
    } catch (error) {
      console.warn('Error getting text width, using fallback:', error);
      testWidth = testLine.length * 2.5; // Rough estimation
    }
    
    if (testWidth <= maxWidth - PDF_CONFIG.textWrapMargin) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle very long words that exceed cell width
        const maxChars = Math.floor((maxWidth - PDF_CONFIG.textWrapMargin) / 2.5); // Rough character estimate
        if (word.length > maxChars && maxChars > 3) {
          lines.push(word.substring(0, maxChars - 3) + '...');
        } else {
          lines.push(word);
        }
        currentLine = '';
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};
