
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CreateProposalQuotationSectionProps {
  onQuotationDataChange?: (data: any) => void;
}

export const CreateProposalQuotationSection: React.FC<CreateProposalQuotationSectionProps> = ({
  onQuotationDataChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  React.useEffect(() => {
    if (onQuotationDataChange) {
      onQuotationDataChange({
        ...quotationData,
        items,
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal
      });
    }
  }, [quotationData, items, subtotal, discountAmount, taxAmount, grandTotal, onQuotationDataChange]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <div>
                  <CardTitle>Quotation Information (Optional)</CardTitle>
                  <CardDescription>
                    Add pricing and quotation details to your proposal
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {grandTotal > 0 && (
                  <Badge variant="secondary">
                    Total: {quotationData.currency} {grandTotal.toFixed(2)}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Quotation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input
                  id="quotationNumber"
                  value={quotationData.quotationNumber}
                  onChange={(e) => setQuotationData({...quotationData, quotationNumber: e.target.value})}
                  placeholder="Q-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quotationData.validUntil}
                  onChange={(e) => setQuotationData({...quotationData, validUntil: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={quotationData.currency} onValueChange={(value) => setQuotationData({...quotationData, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="SAR">SAR (﷼)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Line Items</h4>
                <Button onClick={addItem} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                      <div className="md:col-span-5">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder={`Item ${index + 1} description...`}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Quantity</Label>
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
                        <Label className="text-xs">Unit Price</Label>
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
                        <Label className="text-xs">Total</Label>
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

            {/* Pricing Summary */}
            {items.length > 0 && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Pricing Summary</h4>
                
                {/* Discount and Tax */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <Select 
                      value={quotationData.discountType} 
                      onValueChange={(value) => setQuotationData({...quotationData, discountType: value})}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={quotationData.discountValue}
                      onChange={(e) => setQuotationData({...quotationData, discountValue: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
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

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{quotationData.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-{quotationData.currency} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({quotationData.taxRate}%):</span>
                      <span className="font-medium">{quotationData.currency} {taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <Badge variant="default" className="text-base px-3 py-1">
                      {quotationData.currency} {grandTotal.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quotationNotes">Quotation Notes</Label>
                <Textarea
                  id="quotationNotes"
                  value={quotationData.notes}
                  onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
                  placeholder="Any additional notes for this quotation..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="quotationTerms">Payment Terms</Label>
                <Textarea
                  id="quotationTerms"
                  value={quotationData.terms}
                  onChange={(e) => setQuotationData({...quotationData, terms: e.target.value})}
                  placeholder="Payment terms, delivery conditions, etc..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
