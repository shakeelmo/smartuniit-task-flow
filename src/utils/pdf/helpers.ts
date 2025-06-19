
import jsPDF from 'jspdf';
import { CurrencyInfo } from './types';

export const fireToast = (msg: string, description?: string, variant: "default" | "destructive" = "default") => {
  console.log(`Toast: ${msg} - ${description} (${variant})`);
  try {
    // @ts-ignore
    const toast = window?.__LOVABLE_GLOBAL_TOAST__ || (window?.toast ? window.toast : undefined)
    if (toast) {
      toast({ title: msg, description, variant });
    } else {
      console.warn('Toast function not available, falling back to console');
      if (variant === "destructive") {
        console.error(`${msg}: ${description}`);
      } else {
        console.info(`${msg}: ${description}`);
      }
    }
  } catch (error) {
    console.error('Error firing toast:', error);
  }
};

export const fetchImageBase64 = (url: string): Promise<string> => {
  console.log('Attempting to fetch image:', url);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.setAttribute('crossOrigin', 'anonymous');
    
    img.onload = function () {
      console.log('Image loaded successfully, converting to base64...');
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get canvas context');
          return reject('Could not get canvas context');
        }
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        console.log('Image converted to base64 successfully');
        resolve(dataURL);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        reject('Error converting image to base64: ' + error);
      }
    };
    
    img.onerror = function (err) {
      console.error('Failed to load image:', url, err);
      reject('Could not load image for PDF: ' + url);
    };
    
    img.src = url;
  });
};

// Helper function to add text with proper line wrapping
export const addTextWithWrapping = (pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 4) => {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  lines.forEach((line: string) => {
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });
  
  return currentY;
};

export const getCurrencyInfo = (currency: 'SAR' | 'USD'): CurrencyInfo => {
  return {
    symbol: currency === 'SAR' ? 'ر.س' : '$',
    name: currency === 'SAR' ? 'Saudi Riyals' : 'US Dollars'
  };
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: '2-digit' 
  });
};
