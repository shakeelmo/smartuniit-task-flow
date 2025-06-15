
import jsPDF from 'jspdf';
import { QuotationData } from '../types';
import { COLORS, PDF_CONFIG } from '../constants';
import { getCurrencyInfo } from '../helpers';

export const addTotalsSection = (
  pdf: jsPDF,
  quotationData: QuotationData,
  yPosition: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const currencyInfo = getCurrencyInfo(quotationData.currency);
  let currentY = yPosition;

  const hasPartNumbers = quotationData.lineItems.some(item => item.partNumber && item.partNumber.trim());
  const tableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin;

  const columnWidths = hasPartNumbers
    ? [12, 48, 20, 15, 35, 40]
    : [12, 70, 18, 35, 40];

  let labelStartX = PDF_CONFIG.pageMargin;
  const labelsSpan = hasPartNumbers ? 4 : 3;
  for (let i = 0; i < labelsSpan; i++) {
    labelStartX += columnWidths[i];
  }

  const valueColumnIndex = hasPartNumbers ? 5 : 4;
  let valueStartX = PDF_CONFIG.pageMargin;
  for (let i = 0; i < valueColumnIndex; i++) {
    valueStartX += columnWidths[i];
  }
  const valueColumnWidth = columnWidths[valueColumnIndex];

  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');

  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSize.normal);

  pdf.text(`Subtotal in ${currencyInfo.name}`, labelStartX + 2, currentY + 6);

  const subtotalFormatted = quotationData.subtotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const subtotalText = quotationData.currency === 'SAR' ? `${subtotalFormatted} SR` : `$${subtotalFormatted}`;
  const subtotalWidth = pdf.getTextWidth(subtotalText);
  const subtotalX = valueStartX + valueColumnWidth - subtotalWidth - 2;
  pdf.text(subtotalText, subtotalX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  // Discount row (if applicable)
  if (quotationData.discount && quotationData.discount > 0) {
    pdf.setFillColor(...COLORS.yellow);
    pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');

    pdf.setTextColor(...COLORS.black);

    let discountLabel = 'Discount';
    if (quotationData.discountType === 'percentage') {
      if (typeof quotationData.discountPercent === 'number') {
        discountLabel = `Discount (${quotationData.discountPercent}%)`;
      } else {
        discountLabel = 'Discount (%)';
      }
    }

    pdf.text(discountLabel, labelStartX + 2, currentY + 6);

    const discountFormatted = quotationData.discount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const discountText = quotationData.currency === 'SAR'
      ? `-${discountFormatted} SR`
      : `-$${discountFormatted}`;
    const discountWidth = pdf.getTextWidth(discountText);
    const discountX = valueStartX + valueColumnWidth - discountWidth - 2;
    pdf.text(discountText, discountX, currentY + 6);

    currentY += PDF_CONFIG.rowHeight;
  }

  pdf.setFillColor(...COLORS.yellow);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  pdf.setTextColor(...COLORS.black);
  pdf.text('VAT 15%', labelStartX + 2, currentY + 6);

  const vatFormatted = quotationData.vat.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const vatText = quotationData.currency === 'SAR' ? `${vatFormatted} SR` : `$${vatFormatted}`;
  const vatWidth = pdf.getTextWidth(vatText);
  const vatX = valueStartX + valueColumnWidth - vatWidth - 2;
  pdf.text(vatText, vatX, currentY + 6);

  currentY += PDF_CONFIG.rowHeight;

  pdf.setFillColor(...COLORS.tableHeaderBlue);
  pdf.rect(PDF_CONFIG.pageMargin, currentY, tableWidth, PDF_CONFIG.rowHeight, 'F');
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Price in ${currencyInfo.name}`, labelStartX + 2, currentY + 6);

  const totalFormatted = quotationData.total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const totalText = quotationData.currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
  const totalWidth = pdf.getTextWidth(totalText);
  const totalX = valueStartX + valueColumnWidth - totalWidth - 2;
  pdf.text(totalText, totalX, currentY + 6);

  return currentY + 25;
};
