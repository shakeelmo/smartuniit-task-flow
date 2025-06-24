
import React from 'react';

interface TotalsSummaryProps {
  calculateSubtotal: () => number;
  calculateDiscountAmount: () => number;
  calculateAfterDiscount: () => number;
  calculateVAT: () => number;
  calculateTotal: () => number;
  getCurrencySymbol: () => string;
}

// Helper function to format numbers with comma separators
const formatNumberWithCommas = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const TotalsSummary: React.FC<TotalsSummaryProps> = ({
  calculateSubtotal,
  calculateDiscountAmount,
  calculateAfterDiscount,
  calculateVAT,
  calculateTotal,
  getCurrencySymbol,
}) => {
  // Use SAR text for Saudi Riyal to match PDF output and avoid symbol encoding issues
  const displaySymbol = getCurrencySymbol() === '﷼' ? 'SAR' : getCurrencySymbol();
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal / المجموع الفرعي:</span>
          <span className="font-medium">{formatNumberWithCommas(calculateSubtotal())} {displaySymbol}</span>
        </div>
        {calculateDiscountAmount() > 0 && (
          <div className="flex justify-between text-yellow-600">
            <span>Discount / الخصم:</span>
            <span className="font-medium">{formatNumberWithCommas(calculateDiscountAmount())} {displaySymbol}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>After Discount / بعد الخصم:</span>
          <span className="font-medium">{formatNumberWithCommas(calculateAfterDiscount())} {displaySymbol}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%) / ضريبة القيمة المضافة:</span>
          <span className="font-medium">{formatNumberWithCommas(calculateVAT())} {displaySymbol}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total / المجموع الكلي:</span>
          <span>{formatNumberWithCommas(calculateTotal())} {displaySymbol}</span>
        </div>
      </div>
    </div>
  );
};

export default TotalsSummary;
