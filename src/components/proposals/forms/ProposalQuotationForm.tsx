import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ProposalQuotationFormProps {
  proposalId: string;
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const ProposalQuotationForm: React.FC<ProposalQuotationFormProps> = ({ 
  proposalId, 
  proposal,
  onUpdate,
  loading: externalLoading 
}) => {
  const [loading, setLoading] = useState(false);
  const [quotationData, setQuotationData] = useState({
    quotationNumber: '',
    validUntil: '',
    currency: 'USD',
    taxRate: 0,
    discountType: 'percentage',
    discountValue: 0,
    notes: '',
    terms: ''
  });

  const [items, setItems] = useState<QuotationItem[]>([]);

  // Load existing quotation data when component mounts
  useEffect(() => {
    if (proposal && proposal.quotation_data) {
      const existingData = proposal.quotation_data;
      setQuotationData({
        quotationNumber: existingData.quotationNumber || '',
        validUntil: existingData.validUntil || '',
        currency: existingData.currency || 'USD',
        taxRate: existingData.taxRate || 0,
        discountType: existingData.discountType || 'percentage',
        discountValue: existingData.discountValue || 0,
        notes: existingData.notes || '',
        terms: existingData.terms || ''
      });
      setItems(existingData.items || []);
    }
  }, [proposal]);

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = quotationData.discountType === 'percentage' 
    ? (subtotal * quotationData.discountValue) / 100 
    : quotationData.discountValue;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * quotationData.taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const getCurrencySymbol = () => {
    switch (quotationData.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'SAR': return '﷼';
      default: return '$';
    }
  };

  const prepareQuotationDataForSave = () => {
    // Convert items to plain objects compatible with Json type
    const serializedItems = items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    }));

    return {
      ...quotationData,
      items: serializedItems,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    };
  };

  const handleSaveQuotation = async () => {
    setLoading(true);
    try {
      const quotationDataToSave = prepareQuotationDataForSave();

      const updateData = {
        quotation_data: quotationDataToSave as any
      };

      if (onUpdate) {
        // Use the parent's update function if provided
        await onUpdate(updateData);
      } else {
        // Direct database update
        const { error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quotation saved successfully",
        });
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Error",
        description: "Failed to save quotation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setLoading(true);
    try {
      const quotationDataToSave = {
        ...prepareQuotationDataForSave(),
        status: 'draft'
      };

      const updateData = {
        quotation_data: quotationDataToSave as any,
        status: 'draft'
      };

      if (onUpdate) {
        await onUpdate(updateData);
      } else {
        const { error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quotation saved as draft",
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Quotation Information
          </h2>
          <p className="text-gray-600">معلومات عرض الأسعار - Add pricing and quotation details to your proposal</p>
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quote Details / تفاصيل العرض</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="quotationNumber">Quotation Number / رقم العرض</Label>
            <Input
              id="quotationNumber"
              value={quotationData.quotationNumber}
              onChange={(e) => setQuotationData({...quotationData, quotationNumber: e.target.value})}
              placeholder="Q-2024-001"
            />
          </div>
          <div>
            <Label htmlFor="validUntil">Valid Until / صالح حتى</Label>
            <Input
              id="validUntil"
              type="date"
              value={quotationData.validUntil}
              onChange={(e) => setQuotationData({...quotationData, validUntil: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency / العملة</Label>
            <Select value={quotationData.currency} onValueChange={(value) => setQuotationData({...quotationData, currency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                <SelectItem value="SAR">SAR (﷼) - Saudi Riyal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Services / الخدمات</h3>
          <Button onClick={addItem} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No items added yet. Click "Add Item" to get started.
            <br />
            لم يتم إضافة أي عناصر بعد. انقر على "إضافة عنصر" للبدء.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-white">
                <div className="md:col-span-5">
                  <Label className="text-xs">Description / الوصف</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder={`Item ${index + 1} description... / وصف العنصر ${index + 1}`}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Quantity / الكمية</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Unit Price / سعر الوحدة</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Total / المجموع</Label>
                  <Input
                    value={item.total.toFixed(2)}
                    readOnly
                    className="bg-gray-50 text-sm font-medium"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 w-full md:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount Section */}
      {items.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            Discount / الخصم
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Discount Type / نوع الخصم</Label>
              <Select 
                value={quotationData.discountType} 
                onValueChange={(value) => setQuotationData({...quotationData, discountType: value})}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="percentage">Percentage (%) / نسبة مئوية</SelectItem>
                  <SelectItem value="fixed">Fixed Amount / مبلغ ثابت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {quotationData.discountType === 'percentage' 
                  ? 'Discount (%) / نسبة الخصم' 
                  : `Discount Amount (${quotationData.currency}) / مبلغ الخصم`}
              </Label>
              <Input
                type="number"
                value={quotationData.discountValue}
                onChange={(e) => setQuotationData({...quotationData, discountValue: parseFloat(e.target.value) || 0})}
                min="0"
                max={quotationData.discountType === 'percentage' ? 100 : undefined}
                step={quotationData.discountType === 'percentage' ? 0.1 : 0.01}
                className="text-sm"
              />
            </div>
            <div>
              <Label>Tax Rate (%) / معدل الضريبة</Label>
              <Input
                type="number"
                value={quotationData.taxRate}
                onChange={(e) => setQuotationData({...quotationData, taxRate: parseFloat(e.target.value) || 0})}
                min="0"
                max="100"
                step="0.01"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Pricing Summary / ملخص التسعير</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal / المجموع الفرعي:</span>
              <span className="font-medium">{getCurrencySymbol()} {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount / الخصم:</span>
                <span className="font-medium">-{getCurrencySymbol()} {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>After Discount / بعد الخصم:</span>
              <span className="font-medium">{getCurrencySymbol()} {taxableAmount.toLocaleString()}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({quotationData.taxRate}%) / الضريبة:</span>
                <span className="font-medium">{getCurrencySymbol()} {taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total / المجموع الكلي:</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {getCurrencySymbol()} {grandTotal.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notes">Quotation Notes / ملاحظات العرض</Label>
          <Textarea
            id="notes"
            value={quotationData.notes}
            onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
            placeholder="Any additional notes for this quotation... / أي ملاحظات إضافية لهذا العرض"
            rows={4}
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="terms">Payment Terms / شروط الدفع</Label>
          <Textarea
            id="terms"
            value={quotationData.terms}
            onChange={(e) => setQuotationData({...quotationData, terms: e.target.value})}
            placeholder="Payment terms, delivery conditions, etc... / شروط الدفع وشروط التسليم"
            rows={4}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleSaveAsDraft}
          disabled={loading || externalLoading}
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button 
          className="bg-smart-orange hover:bg-smart-orange/90"
          onClick={handleSaveQuotation}
          disabled={loading || externalLoading}
        >
          {loading ? 'Saving...' : 'Save Quotation'}
        </Button>
      </div>
    </div>
  );
};
