
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface CommercialItem {
  id: string;
  serial_number: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

interface CommercialItemsTableProps {
  items: CommercialItem[];
  onItemsChange: (items: CommercialItem[]) => void;
}

export const CommercialItemsTable: React.FC<CommercialItemsTableProps> = ({
  items,
  onItemsChange
}) => {
  const addItem = () => {
    const newItem: CommercialItem = {
      id: `temp_${Date.now()}`,
      serial_number: items.length + 1,
      description: '',
      quantity: 1,
      unit: 'Each',
      unit_price: 0,
      total_price: 0
    };
    onItemsChange([...items, newItem]);
    
    toast({
      title: "Item Added",
      description: "New commercial item has been added to the quotation.",
    });
  };

  const updateItem = (id: string, field: keyof CommercialItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = Number(updatedItem.quantity) * Number(updatedItem.unit_price);
        }
        return updatedItem;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter(item => item.id !== id));
      toast({
        title: "Item Removed",
        description: "Commercial item has been removed from the quotation.",
      });
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one item is required in the commercial quotation.",
        variant: "destructive"
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
        <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quotation items yet</h3>
        <p className="text-gray-600 mb-4">Add commercial items to create your quotation</p>
        <Button onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quotation Items ({items.length} items)</h3>
        <Button onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16 font-semibold">S.No</TableHead>
              <TableHead className="min-w-[300px] font-semibold">Description</TableHead>
              <TableHead className="w-20 font-semibold">Qty</TableHead>
              <TableHead className="w-24 font-semibold">Unit</TableHead>
              <TableHead className="w-32 font-semibold">Unit Price (SAR)</TableHead>
              <TableHead className="w-32 font-semibold">Total (SAR)</TableHead>
              <TableHead className="w-20 font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Enter detailed item description..."
                    rows={2}
                    className="text-sm min-w-[280px] border-gray-200"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="text-sm w-16 text-center"
                  />
                </TableCell>
                <TableCell>
                  <Select value={item.unit} onValueChange={(value) => updateItem(item.id, 'unit', value)}>
                    <SelectTrigger className="text-sm w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="Each">Each</SelectItem>
                      <SelectItem value="Hours">Hours</SelectItem>
                      <SelectItem value="Days">Days</SelectItem>
                      <SelectItem value="Months">Months</SelectItem>
                      <SelectItem value="Years">Years</SelectItem>
                      <SelectItem value="Pieces">Pieces</SelectItem>
                      <SelectItem value="Units">Units</SelectItem>
                      <SelectItem value="m²">m²</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="text-sm w-28 text-right"
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.total_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    readOnly
                    className="bg-gray-50 text-sm font-medium w-28 text-right border-gray-200"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
