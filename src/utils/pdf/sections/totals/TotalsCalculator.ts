
import { QuotationData } from '../../types';
import { getCurrencyInfo } from '../../helpers';

export interface TotalsData {
  subtotal: {
    amount: number;
    formatted: string;
    text: string;
  };
  discount?: {
    amount: number;
    formatted: string;
    text: string;
    label: string;
  };
  vat: {
    amount: number;
    formatted: string;
    text: string;
  };
  total: {
    amount: number;
    formatted: string;
    text: string;
  };
  currencyInfo: {
    name: string;
    symbol: string;
  };
}

export const calculateTotalsData = (quotationData: QuotationData): TotalsData => {
  const currencyInfo = getCurrencyInfo(quotationData.currency);
  
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatCurrency = (amount: number): string => {
    const formatted = formatAmount(amount);
    return quotationData.currency === 'SAR' ? `${formatted} SAR` : `$${formatted}`;
  };

  const subtotal = {
    amount: quotationData.subtotal,
    formatted: formatAmount(quotationData.subtotal),
    text: formatCurrency(quotationData.subtotal)
  };

  const vat = {
    amount: quotationData.vat,
    formatted: formatAmount(quotationData.vat),
    text: formatCurrency(quotationData.vat)
  };

  const total = {
    amount: quotationData.total,
    formatted: formatAmount(quotationData.total),
    text: formatCurrency(quotationData.total)
  };

  let discount: TotalsData['discount'] = undefined;
  if (quotationData.discount && quotationData.discount > 0) {
    let discountLabel = 'Discount';
    if (quotationData.discountType === 'percentage') {
      if (typeof quotationData.discountPercent === 'number') {
        discountLabel = `Discount (${quotationData.discountPercent}%)`;
      }
    }

    discount = {
      amount: quotationData.discount,
      formatted: formatAmount(quotationData.discount),
      text: quotationData.currency === 'SAR'
        ? `-${formatAmount(quotationData.discount)} SAR`
        : `-$${formatAmount(quotationData.discount)}`,
      label: discountLabel
    };
  }

  return {
    subtotal,
    discount,
    vat,
    total,
    currencyInfo
  };
};
