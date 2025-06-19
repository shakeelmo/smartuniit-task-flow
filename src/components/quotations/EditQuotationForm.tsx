
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Percent } from 'lucide-react';
import CustomerForm from './CustomerForm';
import LineItemsTable from './LineItemsTable';

interface EditQuotationFormProps {
  customer: any;
  setCustomer: any;
  customerType: 'existing' | 'new';
  setCustomerType: (type: 'existing' | 'new') => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
  lineItems: any[];
  updateLineItem: (id: string, field: any, value: any) => void;
  removeLineItem: (id: string) => void;
  addLineItem: () => void;
  currency: 'SAR' | 'USD';
  setCurrency: (currency: 'SAR' | 'USD') => void;
  validUntil: string;
  setValidUntil: (date: string) => void;
  quotationNumber: string;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  discount: number;
  setDiscount: (discount: number) => void;
  calculateDiscountAmount: () => number;
  getCurrencySymbol: () => string;
  customTerms: string;
  setCustomTerms: (terms: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

const EditQuotationForm = ({
  customer, setCustomer,
  customerType, setCustomerType,
  showUnitColumn, setShowUnitColumn,
  lineItems, updateLineItem, removeLineItem, addLineItem,
  currency, setCurrency,
  validUntil, setValidUntil,
  quotationNumber,
  discountType, setDiscountType,
  discount, setDiscount,
  calculateDiscountAmount,
  getCurrencySymbol,
  customTerms, setCustomTerms,
  notes, setNotes
}: EditQuotationFormProps) => {
  return (
    <div className="space-y-6">
      <CustomerForm 
        customer={customer} 
        setCustomer={setCustomer}
        customerType={customerType}
        setCustomerType={setCustomerType}
      />

      {/* Quote Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quote Details / تفاصيل العرض</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currency">Currency / العملة</Label>
            <Select value={currency} onValueChange={(value: 'SAR' | 'USD') => setCurrency(value)}>
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
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="quoteNumber">Quote Number / رقم العرض</Label>
            <Input
              id="quoteNumber"
              value={quotationNumber}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Services / الخدمات</h3>
          <Button onClick={addLineItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        <LineItemsTable
          lineItems={lineItems}
          updateLineItem={updateLineItem}
          removeLineItem={removeLineItem}
          showUnitColumn={showUnitColumn}
          setShowUnitColumn={setShowUnitColumn}
        />
      </div>

      {/* Discount Section */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Percent className="h-5 w-5 mr-2" />
          Discount / الخصم
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discountType">Discount Type / نوع الخصم</Label>
            <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
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
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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

      {/* Terms and Conditions */}
      <div>
        <Label htmlFor="customTerms">Terms and Conditions / الشروط والأحكام</Label>
        <Textarea
          id="customTerms"
          value={customTerms}
          onChange={(e) => setCustomTerms(e.target.value)}
          placeholder="Enter terms and conditions..."
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes / ملاحظات إضافية</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default EditQuotationForm;
