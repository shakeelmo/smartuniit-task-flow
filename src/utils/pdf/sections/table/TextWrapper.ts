
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
  
  // Enhanced text cleaning for professional appearance
  const cleanText = String(text)
    .trim()
    .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Keep printable ASCII and Latin extended
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\r\n]+/g, '\n') // Normalize line breaks
    .trim();
  
  if (!cleanText || cleanText.length === 0) {
    return [''];
  }

  // Handle explicit line breaks first for better formatting
  const paragraphs = cleanText.split('\n');
  const allLines: string[] = [];

  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) {
      allLines.push(''); // Preserve empty lines for formatting
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
        testWidth = testLine.length * 2.2; // More accurate estimation
      }
      
      // Optimized margin for better space utilization
      const effectiveMaxWidth = maxWidth - 1; // Minimal margin for professional tight spacing
      
      if (testWidth <= effectiveMaxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          // Enhanced handling of very long words
          const maxChars = Math.floor(effectiveMaxWidth / 2.2);
          if (word.length > maxChars && maxChars > 8) {
            // Smart word breaking at natural points
            let remainingWord = word;
            while (remainingWord.length > maxChars) {
              // Try to break at natural points (hyphens, underscores)
              let breakPoint = maxChars - 3;
              const naturalBreaks = ['-', '_', '.'];
              
              for (let i = breakPoint; i > breakPoint - 10 && i > 5; i--) {
                if (naturalBreaks.includes(remainingWord[i])) {
                  breakPoint = i + 1;
                  break;
                }
              }
              
              allLines.push(remainingWord.substring(0, breakPoint) + (breakPoint < remainingWord.length ? '-' : ''));
              remainingWord = remainingWord.substring(breakPoint);
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
