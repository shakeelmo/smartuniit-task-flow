
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, DollarSign, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  branch: string;
}

interface ProposalCommercialFormProps {
  proposalId: string;
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const ProposalCommercialForm: React.FC<ProposalCommercialFormProps> = ({
  proposalId,
  proposal,
  onUpdate,
  loading: externalLoading
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CommercialItem[]>([]);
  const [formData, setFormData] = useState({
    payment_terms: '',
    project_duration_days: '',
    bank_details: {
      bank_name: '',
      account_name: '',
      account_number: '',
      iban: '',
      swift_code: '',
      branch: ''
    } as BankDetails
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        payment_terms: proposal.payment_terms || '',
        project_duration_days: proposal.project_duration_days?.toString() || '',
        bank_details: proposal.bank_details || {
          bank_name: '',
          account_name: '',
          account_number: '',
          iban: '',
          swift_code: '',
          branch: ''
        }
      });
    }
    loadCommercialItems();
  }, [proposal, proposalId]);

  const loadCommercialItems = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_commercial_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading commercial items:', error);
    }
  };

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
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof CommercialItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = Number(updatedItem.quantity) * Number(updatedItem.unit_price);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateBankDetails = (field: keyof BankDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [field]: value
      }
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save proposal data
      const proposalData = {
        payment_terms: formData.payment_terms,
        project_duration_days: formData.project_duration_days ? parseInt(formData.project_duration_days) : null,
        bank_details: formData.bank_details
      };

      if (onUpdate) {
        await onUpdate(proposalData);
      } else {
        const { error: proposalError } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', proposalId);

        if (proposalError) throw proposalError;
      }

      // Save commercial items
      // Delete existing items
      await supabase
        .from('proposal_commercial_items')
        .delete()
        .eq('proposal_id', proposalId);

      // Insert new items
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          proposal_id: proposalId,
          serial_number: index + 1,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
          unit_price: Number(item.unit_price),
          sort_order: index
        }));

        const { error: itemsError } = await supabase
          .from('proposal_commercial_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Commercial proposal saved successfully",
      });

      // Reload items to get proper IDs
      loadCommercialItems();
    } catch (error) {
      console.error('Error saving commercial proposal:', error);
      toast({
        title: "Error",
        description: "Failed to save commercial proposal",
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
            <DollarSign className="h-6 w-6" />
            Commercial Proposal
          </h2>
          <p className="text-gray-600">Detailed pricing, terms, and commercial information</p>
        </div>
      </div>

      {/* Commercial Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commercial Items</CardTitle>
            <Button onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              No commercial items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-1">S.No</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border rounded">
                  <div className="col-span-1 flex items-center">
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                  <div className="col-span-4">
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Select value={item.unit} onValueChange={(value) => updateItem(item.id, 'unit', value)}>
                      <SelectTrigger className="text-sm">
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={item.total_price.toFixed(2)}
                      readOnly
                      className="bg-gray-50 text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-1">
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

              {/* Grand Total */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Grand Total: SAR {grandTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Terms & Project Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Terms & Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project_duration_days">Project Duration (Days)</Label>
                <Input
                  id="project_duration_days"
                  type="number"
                  value={formData.project_duration_days}
                  onChange={(e) => setFormData({...formData, project_duration_days: e.target.value})}
                  placeholder="e.g., 90"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  placeholder="Describe payment terms, milestones, etc..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={formData.bank_details.bank_name}
                  onChange={(e) => updateBankDetails('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input
                  value={formData.bank_details.account_name}
                  onChange={(e) => updateBankDetails('account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={formData.bank_details.account_number}
                  onChange={(e) => updateBankDetails('account_number', e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input
                  value={formData.bank_details.iban}
                  onChange={(e) => updateBankDetails('iban', e.target.value)}
                  placeholder="International Bank Account Number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading || externalLoading}
        >
          {loading ? 'Saving...' : 'Save Commercial Proposal'}
        </Button>
      </div>
    </div>
  );
};
