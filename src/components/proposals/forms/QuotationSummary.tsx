
import React from 'react';

interface QuotationSummaryProps {
  grandTotal: number;
}

export const QuotationSummary: React.FC<QuotationSummaryProps> = ({ grandTotal }) => {
  const vatRate = 0.15; // 15% VAT
  const vatAmount = grandTotal * vatRate;
  const totalWithVat = grandTotal + vatAmount;

  return (
    <div className="border-t-2 pt-6">
      <div className="flex justify-end">
        <div className="text-right space-y-3 min-w-[300px]">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-medium">SAR {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
            <span>VAT (15%):</span>
            <span>SAR {vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-green-700 bg-green-50 p-3 rounded">
            <span>Grand Total:</span>
            <span>SAR {totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
