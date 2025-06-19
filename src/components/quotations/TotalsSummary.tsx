
import React from 'react';

interface TotalsSummaryProps {
  calculateSubtotal: () => number;
  calculateDiscountAmount: () => number;
  calculateAfterDiscount: () => number;
  calculateVAT: () => number;
  calculateTotal: () => number;
  getCurrencySymbol: () => string;
}

const TotalsSummary: React.FC<TotalsSummaryProps> = ({
  calculateSubtotal,
  calculateDiscountAmount,
  calculateAfterDiscount,
  calculateVAT,
  calculateTotal,
  getCurrencySymbol,
}) => {
  // Use simple "SAR" text for UI display to match PDF output
  const displaySymbol = getCurrencySymbol() === 'SAR' ? 'SAR' : getCurrencySymbol();
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal / المجموع الفرعي:</span>
          <span className="font-medium">{calculateSubtotal().toLocaleString()} {displaySymbol}</span>
        </div>
        {calculateDiscountAmount() > 0 && (
          <div className="flex justify-between text-yellow-600">
            <span>Discount / الخصم:</span>
            <span className="font-medium">{calculateDiscountAmount().toLocaleString()} {displaySymbol}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>After Discount / بعد الخصم:</span>
          <span className="font-medium">{calculateAfterDiscount().toLocaleString()} {displaySymbol}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%) / ضريبة القيمة المضافة:</span>
          <span className="font-medium">{calculateVAT().toLocaleString()} {displaySymbol}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total / المجموع الكلي:</span>
          <span>{calculateTotal().toLocaleString()} {displaySymbol}</span>
        </div>
      </div>
    </div>
  );
};

export default TotalsSummary;
