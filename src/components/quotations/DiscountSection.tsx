
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiscountSectionProps {
  discountType: 'percentage' | 'fixed';
  setDiscountType: (t: 'percentage' | 'fixed') => void;
  discount: number;
  setDiscount: (n: number) => void;
  currency: 'SAR' | 'USD';
  calculateDiscountAmount: () => number;
  getCurrencySymbol: () => string;
}

const DiscountSection: React.FC<DiscountSectionProps> = ({
  discountType,
  setDiscountType,
  discount,
  setDiscount,
  currency,
  calculateDiscountAmount,
  getCurrencySymbol,
}) => (
  <div className="bg-yellow-50 p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Percent className="h-5 w-5 mr-2" />
      Discount / الخصم
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="discountType">Discount Type / نوع الخصم</Label>
        <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%) / نسبة مئوية</SelectItem>
            <SelectItem value="fixed">Fixed Amount / مبلغ ثابت</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="discount">
          {discountType === 'percentage' ? 'Discount (%) / نسبة الخصم' : `Discount Amount (${currency}) / مبلغ الخصم`}
        </Label>
        <Input
          id="discount"
          type="number"
          value={discount}
          onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
          min="0"
          max={discountType === 'percentage' ? 100 : undefined}
          step={discountType === 'percentage' ? 0.1 : 0.01}
          placeholder="0"
        />
      </div>
      <div className="flex items-end">
        <div className="text-sm text-gray-600">
          <div>Discount Amount: {getCurrencySymbol()} {calculateDiscountAmount().toLocaleString()}</div>
          <div>مبلغ الخصم</div>
        </div>
      </div>
    </div>
  </div>
);

export default DiscountSection;
