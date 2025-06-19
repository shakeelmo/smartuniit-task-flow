
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
  // Use the correct Saudi Riyal symbol
  const displaySymbol = getCurrencySymbol() === '﷼' ? 'ر.س' : getCurrencySymbol();
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal / المجموع الفرعي:</span>
          <span className="font-medium">{displaySymbol} {calculateSubtotal().toLocaleString()}</span>
        </div>
        {calculateDiscountAmount() > 0 && (
          <div className="flex justify-between text-yellow-600">
            <span>Discount / الخصم:</span>
            <span className="font-medium">{displaySymbol} {calculateDiscountAmount().toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>After Discount / بعد الخصم:</span>
          <span className="font-medium">{displaySymbol} {calculateAfterDiscount().toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%) / ضريبة القيمة المضافة:</span>
          <span className="font-medium">{displaySymbol} {calculateVAT().toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total / المجموع الكلي:</span>
          <span>{displaySymbol} {calculateTotal().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TotalsSummary;
