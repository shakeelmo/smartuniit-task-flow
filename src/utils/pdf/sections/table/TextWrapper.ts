
import jsPDF from 'jspdf';
import { PDF_CONFIG } from '../../constants';

export const wrapText = (
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number = PDF_CONFIG.fontSize.small
): string[] => {
  pdf.setFontSize(fontSize);
  const words = text.split(' ');
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
        lines.push(word.substring(0, Math.floor(maxWidth / 3)) + '...');
        currentLine = '';
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};
