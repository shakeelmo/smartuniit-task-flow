
import jsPDF from 'jspdf';
import { CurrencyInfo } from './types';

export const fireToast = (msg: string, description?: string, variant: "default" | "destructive" = "default") => {
  try {
    // @ts-ignore
    const toast = window?.__LOVABLE_GLOBAL_TOAST__ || (window?.toast ? window.toast : undefined)
    if (toast) {
      toast({ title: msg, description, variant });
    }
  } catch {}
};

export const fetchImageBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = function (err) {
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
    symbol: currency === 'SAR' ? '﷼' : '$',
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
