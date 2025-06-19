
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

  // Handle explicit line breaks first
  const paragraphs = cleanText.split('\n');
  const allLines: string[] = [];

  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) {
      allLines.push(''); // Preserve empty lines
      return;
    }

    const words = paragraph.split(' ');
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
      
      // Reduced margin to allow more text
      if (testWidth <= maxWidth - (PDF_CONFIG.textWrapMargin / 2)) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          // Handle very long words that exceed cell width
          const maxChars = Math.floor((maxWidth - (PDF_CONFIG.textWrapMargin / 2)) / 2.2); // Better character estimate
          if (word.length > maxChars && maxChars > 5) {
            // Split long words more intelligently
            let remainingWord = word;
            while (remainingWord.length > maxChars) {
              allLines.push(remainingWord.substring(0, maxChars - 3) + '...');
              remainingWord = remainingWord.substring(maxChars - 3);
            }
            if (remainingWord) {
              currentLine = remainingWord;
            } else {
              currentLine = '';
            }
          } else {
            allLines.push(word);
            currentLine = '';
          }
        }
      }
    });
    
    if (currentLine) {
      allLines.push(currentLine);
    }
  });
  
  return allLines.length > 0 ? allLines : [''];
};
