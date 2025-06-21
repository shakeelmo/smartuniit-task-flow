
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, DollarSign, Calendar, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateProposalPDF } from '@/utils/proposalPdfExport';

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
    
    toast({
      title: "Item Added",
      description: "New commercial item has been added to the quotation.",
    });
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
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
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

  // Enhanced quotation data format to ensure proper PDF generation with serial numbers
  const createQuotationData = () => {
    const subtotal = grandTotal;
    const vatRate = 0.15; // 15% VAT
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // Create properly formatted line items with serial numbers for PDF generation
    const formattedLineItems = items.map((item, index) => ({
      serialNumber: index + 1, // Explicit serial number
      service: item.description || `Commercial Item ${index + 1}`, // Use description as service
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      total: Number(item.total_price) || 0,
      unit: item.unit || 'Each'
    }));

    console.log('Creating quotation data with formatted line items:', formattedLineItems);

    return {
      number: `QUO-${proposalId.slice(-8)}`,
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'SAR',
      lineItems: formattedLineItems, // Use the properly formatted items
      subtotal,
      discount: 0,
      discountAmount: 0,
      vat: vatAmount,
      total,
      customTerms: formData.payment_terms,
      notes: `Project Duration: ${formData.project_duration_days} days`,
      customer: {
        companyName: proposal?.client_company_name || 'Commercial Proposal Customer',
        contactPerson: proposal?.client_contact_person || '',
        email: proposal?.client_email || '',
        phone: proposal?.client_phone || '',
        address: ''
      }
    };
  };

  const handleExportPDF = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one commercial item before exporting PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const quotationData = createQuotationData();
      
      // Create proposal data for PDF export
      const proposalDataForPDF = {
        ...proposal,
        quotation_data: quotationData,
        commercial_items: items
      };

      await generateProposalPDF(proposalDataForPDF);
      
      toast({
        title: "PDF Generated",
        description: "Commercial proposal PDF has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create quotation data for the proposal
      const quotationData = items.length > 0 ? createQuotationData() : null;
      
      // Save proposal data including quotation_data
      const proposalData = {
        payment_terms: formData.payment_terms,
        project_duration_days: formData.project_duration_days ? parseInt(formData.project_duration_days) : null,
        bank_details: formData.bank_details as any,
        quotation_data: quotationData // This is crucial for PDF generation
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
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Commercial Proposal & Quotation
            </h2>
            <p className="text-gray-600">Detailed pricing, terms, and commercial information</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPDF}
              disabled={loading || items.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Commercial Items/Quotation Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quotation Items ({items.length} items)
                  </CardTitle>
                  <Button onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quotation items yet</h3>
                    <p className="text-gray-600 mb-4">Add commercial items to create your quotation</p>
                    <Button onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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

                    {/* Quotation Summary */}
                    <div className="border-t-2 pt-6">
                      <div className="flex justify-end">
                        <div className="text-right space-y-3 min-w-[300px]">
                          <div className="flex justify-between text-lg">
                            <span>Subtotal:</span>
                            <span className="font-medium">SAR {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
                            <span>VAT (15%):</span>
                            <span>SAR {(grandTotal * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold text-green-700 bg-green-50 p-3 rounded">
                            <span>Grand Total:</span>
                            <span>SAR {(grandTotal * 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                        placeholder="• 30% advance payment upon contract signing
• 50% payment upon project milestone completion
• 20% final payment upon project delivery and acceptance"
                        rows={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={formData.bank_details.bank_name}
                        onChange={(e) => updateBankDetails('bank_name', e.target.value)}
                        placeholder="e.g., Saudi National Bank"
                      />
                    </div>
                    <div>
                      <Label>Account Name</Label>
                      <Input
                        value={formData.bank_details.account_name}
                        onChange={(e) => updateBankDetails('account_name', e.target.value)}
                        placeholder="Company account holder name"
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
                        placeholder="SA** **** **** **** ****"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Save Button - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {items.length > 0 && (
              <span>Total: SAR {(grandTotal * 1.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({items.length} items)</span>
            )}
          </div>
          <Button 
            onClick={handleSave}
            disabled={loading || externalLoading}
            className="min-w-[200px]"
          >
            {loading ? 'Saving...' : 'Save Commercial Proposal'}
          </Button>
        </div>
      </div>
    </div>
  );
};
