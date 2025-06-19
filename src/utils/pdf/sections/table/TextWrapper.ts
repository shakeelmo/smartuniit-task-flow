
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../../constants';

export const wrapText = (
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number = PDF_CONFIG.fontSize.normal
): string[] => {
  if (!text || typeof text !== 'string') {
    return [''];
  }

  pdf.setFontSize(fontSize);
  
  // Additional text cleaning to handle encoding issues
  const cleanText = text
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable ASCII and Latin extended
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  if (!cleanText) {
    return [''];
  }

  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth <= maxWidth - PDF_CONFIG.textWrapMargin) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle very long words that exceed cell width
        const maxChars = Math.floor((maxWidth - PDF_CONFIG.textWrapMargin) / 2.5); // Rough character estimate
        if (word.length > maxChars) {
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
