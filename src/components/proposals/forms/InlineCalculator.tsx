
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CalculationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

interface InlineCalculatorProps {
  calculationItems: CalculationItem[];
  onCalculationChange: (items: CalculationItem[]) => void;
}

export const InlineCalculator: React.FC<InlineCalculatorProps> = ({
  calculationItems,
  onCalculationChange
}) => {
  const [newItem, setNewItem] = useState<Partial<CalculationItem>>({
    description: '',
    quantity: 1,
    unit: 'meters',
    unitCost: 0
  });

  const updateItem = (id: string, field: keyof CalculationItem, value: string | number) => {
    const updatedItems = calculationItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitCost);
        }
        return updatedItem;
      }
      return item;
    });
    onCalculationChange(updatedItems);
  };

  const addItem = () => {
    if (newItem.description && newItem.quantity && newItem.unitCost) {
      const item: CalculationItem = {
        id: `calc_${Date.now()}`,
        description: newItem.description,
        quantity: Number(newItem.quantity),
        unit: newItem.unit || 'meters',
        unitCost: Number(newItem.unitCost),
        total: Number(newItem.quantity) * Number(newItem.unitCost)
      };
      onCalculationChange([...calculationItems, item]);
      setNewItem({ description: '', quantity: 1, unit: 'meters', unitCost: 0 });
    }
  };

  const removeItem = (id: string) => {
    onCalculationChange(calculationItems.filter(item => item.id !== id));
  };

  const grandTotal = calculationItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Calculator className="h-5 w-5" />
          Inline Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add New Item Form */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-white rounded-lg border">
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Fiber cable, manholes..."
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                placeholder="100"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <Select 
                value={newItem.unit} 
                onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Unit Cost (SAR)</Label>
              <Input
                type="number"
                placeholder="50.00"
                value={newItem.unitCost || ''}
                onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Calculation Items */}
          {calculationItems.length > 0 && (
            <div className="space-y-2">
              {calculationItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex-1 grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium">{item.description}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="h-8 text-center"
                      />
                      <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItem(item.id, 'unitCost', Number(e.target.value))}
                        className="h-8 text-right"
                      />
                    </div>
                    <div className="font-bold text-right">
                      SAR {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Total */}
              <div className="p-3 bg-yellow-100 rounded border-2 border-yellow-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-yellow-800">Total Estimated Cost:</span>
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 text-lg px-3 py-1">
                    SAR {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
