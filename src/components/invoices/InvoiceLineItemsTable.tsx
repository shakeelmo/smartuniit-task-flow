
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceLineItemsTableProps {
  lineItems: LineItem[];
  setLineItems: (lineItems: LineItem[]) => void;
  subtotal: number;
  setSubtotal: (subtotal: number) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (discountType: 'percentage' | 'fixed') => void;
  vat: number;
  setVat: (vat: number) => void;
  total: number;
  setTotal: (total: number) => void;
}

const InvoiceLineItemsTable = ({
  lineItems,
  setLineItems,
  subtotal,
  setSubtotal,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
  vat,
  setVat,
  total,
  setTotal
}: InvoiceLineItemsTableProps) => {
  
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  React.useEffect(() => {
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(newSubtotal);

    const discountAmount = discountType === 'percentage' 
      ? (newSubtotal * discount) / 100 
      : discount;
    
    const afterDiscount = newSubtotal - discountAmount;
    const vatAmount = (afterDiscount * 15) / 100; // 15% VAT
    setVat(vatAmount);
    
    const newTotal = afterDiscount + vatAmount;
    setTotal(newTotal);
  }, [lineItems, discount, discountType, setSubtotal, setVat, setTotal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invoice Items / بنود الفاتورة</h3>
        <Button onClick={addLineItem} size="sm" className="bg-smart-orange hover:bg-smart-orange-light">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description / الوصف</TableHead>
              <TableHead className="w-[15%]">Qty / الكمية</TableHead>
              <TableHead className="w-[20%]">Unit Price / سعر الوحدة</TableHead>
              <TableHead className="w-[15%]">Total / المجموع</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Enter item description"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  ﷼ {item.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {lineItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end">
        <div className="w-80 space-y-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span>Subtotal / المجموع الفرعي:</span>
            <span className="font-medium">﷼ {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Discount / الخصم:</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-20"
                min="0"
                step="0.01"
              />
              <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="fixed">﷼</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span>VAT (15%) / ضريبة القيمة المضافة:</span>
            <span className="font-medium">﷼ {vat.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total / المجموع الكلي:</span>
            <span>﷼ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineItemsTable;
