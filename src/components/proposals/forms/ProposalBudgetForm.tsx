import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProposalBudgetFormProps {
  proposalId: string;
}

export const ProposalBudgetForm: React.FC<ProposalBudgetFormProps> = ({
  proposalId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ 
    item_name: '', 
    description: '', 
    unit: 'Each',
    quantity: '1', 
    unit_price: '' 
  });
  const [editingItem, setEditingItem] = useState({ 
    item_name: '', 
    description: '', 
    unit: 'Each',
    quantity: '1', 
    unit_price: '' 
  });
  const queryClient = useQueryClient();

  const { data: budgetItems, isLoading } = useQuery({
    queryKey: ['budget', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_budget_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  const createItem = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase
        .from('proposal_budget_items')
        .insert([{
          ...item,
          proposal_id: proposalId,
          sort_order: (budgetItems?.length || 0) + 1,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', proposalId] });
      setNewItem({ item_name: '', description: '', unit: 'Each', quantity: '1', unit_price: '' });
      toast({ title: "Success", description: "Budget item added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add budget item", variant: "destructive" });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('proposal_budget_items')
        .update({
          ...data,
          quantity: parseFloat(data.quantity) || 1,
          unit_price: parseFloat(data.unit_price) || 0
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', proposalId] });
      setEditingId(null);
      toast({ title: "Success", description: "Budget item updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update budget item", variant: "destructive" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposal_budget_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', proposalId] });
      toast({ title: "Success", description: "Budget item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete budget item", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (newItem.item_name.trim() && newItem.unit_price) {
      createItem.mutate(newItem);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditingItem({
      item_name: item.item_name,
      description: item.description || '',
      unit: item.unit || 'Each',
      quantity: item.quantity?.toString() || '1',
      unit_price: item.unit_price?.toString() || ''
    });
  };

  const handleSave = () => {
    if (editingId && editingItem.item_name.trim() && editingItem.unit_price) {
      updateItem.mutate({ id: editingId, data: editingItem });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem({ item_name: '', description: '', unit: 'Each', quantity: '1', unit_price: '' });
  };

  const calculateTotal = () => {
    if (!budgetItems) return 0;
    return budgetItems.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading budget...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Budget</h3>
        
        {/* Add new item */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Add New Budget Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-item-name">Item Name *</Label>
              <Input
                id="new-item-name"
                value={newItem.item_name}
                onChange={(e) => setNewItem(prev => ({ ...prev, item_name: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="new-item-description">Description</Label>
              <Textarea
                id="new-item-description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-unit">Unit</Label>
                <Input
                  id="new-unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Each, Hour, Day, etc."
                />
              </div>
              <div>
                <Label htmlFor="new-quantity">Quantity *</Label>
                <Input
                  id="new-quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-unit-price">Unit Price *</Label>
                <Input
                  id="new-unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button 
              onClick={handleAdd} 
              className="flex items-center gap-2"
              disabled={!newItem.item_name.trim() || !newItem.unit_price || createItem.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Budget Item
            </Button>
          </CardContent>
        </Card>

        {/* Existing items */}
        <div className="space-y-4">
          {budgetItems && budgetItems.length > 0 ? (
            <>
              {budgetItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    {editingId === item.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-item-name-${item.id}`}>Item Name *</Label>
                          <Input
                            id={`edit-item-name-${item.id}`}
                            value={editingItem.item_name}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, item_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-item-description-${item.id}`}>Description</Label>
                          <Textarea
                            id={`edit-item-description-${item.id}`}
                            value={editingItem.description}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`edit-unit-${item.id}`}>Unit</Label>
                            <Input
                              id={`edit-unit-${item.id}`}
                              value={editingItem.unit}
                              onChange={(e) => setEditingItem(prev => ({ ...prev, unit: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-quantity-${item.id}`}>Quantity *</Label>
                            <Input
                              id={`edit-quantity-${item.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingItem.quantity}
                              onChange={(e) => setEditingItem(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-unit-price-${item.id}`}>Unit Price *</Label>
                            <Input
                              id={`edit-unit-price-${item.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingItem.unit_price}
                              onChange={(e) => setEditingItem(prev => ({ ...prev, unit_price: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleSave}
                            disabled={!editingItem.item_name.trim() || !editingItem.unit_price || updateItem.isPending}
                            className="flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancel}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {item.item_name}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-6">{item.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 ml-6 text-sm">
                            <span className="text-gray-600">
                              {item.quantity} {item.unit} × ${item.unit_price.toFixed(2)}
                            </span>
                            <span className="font-medium text-primary">
                              = ${(item.quantity * item.unit_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem.mutate(item.id)}
                            disabled={deleteItem.isPending}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Total */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Total Project Cost</h4>
                    <span className="text-2xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                No budget items added yet. Add your first budget item above.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
