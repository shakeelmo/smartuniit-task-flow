
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ProposalQuotationFormProps {
  proposalId: string;
}

export const ProposalQuotationForm: React.FC<ProposalQuotationFormProps> = ({ proposalId }) => {
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

  return (
    <div className="space-y-6">
      {/* Quotation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quotation Details
          </CardTitle>
          <CardDescription>
            Add pricing and quotation information to your proposal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Line Items</CardTitle>
            <Button onClick={addItem} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-5">
                    <Label className="md:hidden">Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description..."
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="md:hidden">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="md:hidden">Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="md:hidden">Total</Label>
                    <Input
                      value={item.total.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <Label>Discount Type</Label>
                <Select 
                  value={quotationData.discountType} 
                  onValueChange={(value) => setQuotationData({...quotationData, discountType: value})}
                >
                  <SelectTrigger>
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
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{quotationData.currency} {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{quotationData.currency} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax ({quotationData.taxRate}%):</span>
                  <span>{quotationData.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {quotationData.currency} {grandTotal.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={quotationData.notes}
              onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
              placeholder="Any additional notes for this quotation..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={quotationData.terms}
              onChange={(e) => setQuotationData({...quotationData, terms: e.target.value})}
              placeholder="Payment terms, delivery conditions, etc..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save as Draft</Button>
        <Button>Save Quotation</Button>
      </div>
    </div>
  );
};
