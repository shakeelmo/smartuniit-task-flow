
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

interface EditLineItemsManagerProps {
  lineItems: LineItem[];
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  addLineItem: () => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
}

const EditLineItemsManager = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  addLineItem,
  showUnitColumn,
  setShowUnitColumn
}: EditLineItemsManagerProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services / الخدمات ({lineItems.length})</h3>
        <div className="flex gap-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showUnitColumn}
              onChange={(e) => setShowUnitColumn(e.target.checked)}
              className="rounded"
            />
            <span>Show Unit Column</span>
          </label>
          <Button onClick={addLineItem} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p>No services added yet. Click "Add Service" to add new services like:</p>
          <p className="mt-2 text-sm">• Civil Services • Power Infrastructure • IT Solutions • Network Services</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-white shadow-sm">
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
              </div>
              
              <div className="col-span-4">
                <Label className="text-xs font-medium">Service Name / اسم الخدمة</Label>
                <Input
                  value={item.service}
                  onChange={(e) => updateLineItem(item.id, 'service', e.target.value)}
                  placeholder="e.g., Civil Services, Power Infrastructure..."
                  className="text-sm mt-1"
                />
              </div>

              <div className="col-span-4">
                <Label className="text-xs font-medium">Description / الوصف</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Detailed description of the service..."
                  rows={2}
                  className="text-sm mt-1"
                />
              </div>

              {showUnitColumn && (
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Part#</Label>
                  <Input
                    value={item.partNumber || ''}
                    onChange={(e) => updateLineItem(item.id, 'partNumber', e.target.value)}
                    placeholder="Part#"
                    className="text-sm mt-1"
                  />
                </div>
              )}

              <div className={showUnitColumn ? "col-span-1" : "col-span-1"}>
                <Label className="text-xs font-medium">Qty / الكمية</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="text-sm mt-1"
                />
              </div>

              <div className={showUnitColumn ? "col-span-1" : "col-span-1"}>
                <Label className="text-xs font-medium">Price / السعر</Label>
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="text-sm mt-1"
                />
              </div>

              <div className="col-span-1 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLineItem(item.id)}
                  className="text-red-600 hover:text-red-700 w-full"
                  disabled={lineItems.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lineItems.length > 0 && (
        <div className="text-center py-4 border-t">
          <Button onClick={addLineItem} variant="outline" className="bg-smart-orange text-white hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Service
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditLineItemsManager;
