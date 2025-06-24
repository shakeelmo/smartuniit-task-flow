
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuoteDetailsGridProps {
  currency: 'SAR' | 'USD';
  setCurrency: (c: 'SAR' | 'USD') => void;
  validUntil: string;
  setValidUntil: (v: string) => void;
  quoteNumber: string;
}

const QuoteDetailsGrid: React.FC<QuoteDetailsGridProps> = ({
  currency,
  setCurrency,
  validUntil,
  setValidUntil,
  quoteNumber
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Quote Details / تفاصيل العرض</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="currency">Currency / العملة</Label>
        <Select value={currency} onValueChange={(v: 'SAR' | 'USD') => setCurrency(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAR">SAR (﷼) - Saudi Riyal</SelectItem>
            <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="validUntil">Valid Until / صالح حتى</Label>
        <Input
          id="validUntil"
          type="date"
          value={validUntil}
          onChange={e => setValidUntil(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="quoteNumber">Quote Number / رقم العرض</Label>
        <Input
          id="quoteNumber"
          value={quoteNumber}
          disabled
          className="bg-gray-100"
        />
      </div>
    </div>
  </div>
);

export default QuoteDetailsGrid;
