
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, Percent, FileText, Import } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SelectExistingQuotationDialog } from './SelectExistingQuotationDialog';

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
  const [showSelectQuotationDialog, setShowSelectQuotationDialog] = useState(false);
  const [savedQuotations, setSavedQuotations] = useState<any[]>([]);
  const [importedQuotationNumber, setImportedQuotationNumber] = useState<string>('');
  
  const [quotationData, setQuotationData] = useState({
    quotationNumber: '',
    validUntil: '',
    currency: 'USD',
    taxRate: 15,
    discountType: 'percentage',
    discountValue: 0,
    notes: '',
    terms: ''
  });

  const [items, setItems] = useState<QuotationItem[]>([]);

  // Load saved quotations from QuotationManagement component's state
  useEffect(() => {
    // Try to get saved quotations from sessionStorage or other global state
    const stored = sessionStorage.getItem('savedQuotations');
    if (stored) {
      try {
        const quotations = JSON.parse(stored);
        setSavedQuotations(quotations);
      } catch (error) {
        console.error('Error parsing saved quotations:', error);
      }
    }
  }, []);

  // Load existing quotation data when component mounts
  useEffect(() => {
    console.log('Loading proposal data:', proposal);
    if (proposal && proposal.quotation_data) {
      const existingData = proposal.quotation_data;
      console.log('Existing quotation data:', existingData);
      setQuotationData({
        quotationNumber: existingData.quotationNumber || '',
        validUntil: existingData.validUntil || '',
        currency: existingData.currency || 'USD',
        taxRate: existingData.taxRate !== undefined ? existingData.taxRate : 15,
        discountType: existingData.discountType || 'percentage',
        discountValue: existingData.discountValue || 0,
        notes: existingData.notes || '',
        terms: existingData.terms || ''
      });
      setItems(existingData.items || []);
      
      // Check if this was imported from an existing quotation
      if (existingData.importedFrom) {
        setImportedQuotationNumber(existingData.importedFrom);
      }
    }
  }, [proposal]);

  const handleImportQuotation = (selectedQuotation: any) => {
    console.log('Importing quotation:', selectedQuotation);
    
    // Convert quotation data to proposal quotation format
    const importedItems = selectedQuotation.lineItems.map((item: any, index: number) => ({
      id: `imported_${Date.now()}_${index}`,
      description: item.service || item.description || '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.quantity || 1) * Number(item.unitPrice || 0)
    }));

    const vatRate = selectedQuotation.vat && selectedQuotation.subtotal ? 
      (selectedQuotation.vat / selectedQuotation.subtotal) * 100 : 15;

    setQuotationData({
      quotationNumber: selectedQuotation.number || '',
      validUntil: selectedQuotation.validUntil ? selectedQuotation.validUntil.split('T')[0] : '',
      currency: selectedQuotation.currency || 'USD',
      taxRate: Math.round(vatRate),
      discountType: selectedQuotation.discountType || 'percentage',
      discountValue: selectedQuotation.discount || 0,
      notes: selectedQuotation.notes || '',
      terms: selectedQuotation.customTerms || ''
    });
    
    setItems(importedItems);
    setImportedQuotationNumber(selectedQuotation.number);
    
    toast({
      title: "Quotation Imported",
      description: `Successfully imported quotation ${selectedQuotation.number}`,
    });
  };

  const addItem = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default form submission behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newItem: QuotationItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    console.log('Adding new item:', newItem);
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    console.log('Total items after addition:', updatedItems.length);
  };

  const removeItem = (id: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default form submission behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Removing item with id:', id);
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    console.log('Remaining items after removal:', updatedItems.length);
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    console.log('Updating item:', id, field, value);
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        console.log('Updated item:', updatedItem);
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
  const discountAmount = quotationData.discountType === 'percentage' 
    ? (subtotal * Number(quotationData.discountValue)) / 100 
    : Number(quotationData.discountValue);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * Number(quotationData.taxRate)) / 100;
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
    const serializedItems = items.map(item => ({
      id: item.id,
      description: String(item.description || '').trim(),
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0
    }));

    const quotationToSave = {
      quotationNumber: String(quotationData.quotationNumber || '').trim(),
      validUntil: quotationData.validUntil,
      currency: quotationData.currency,
      taxRate: Number(quotationData.taxRate) || 15,
      discountType: quotationData.discountType,
      discountValue: Number(quotationData.discountValue) || 0,
      notes: String(quotationData.notes || '').trim(),
      terms: String(quotationData.terms || '').trim(),
      items: serializedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      // Track if this was imported from an existing quotation
      importedFrom: importedQuotationNumber || undefined
    };

    console.log('Prepared quotation data for save:', quotationToSave);
    return quotationToSave;
  };

  const handleSaveQuotation = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Starting save quotation process...');
    setLoading(true);
    
    try {
      const quotationDataToSave = prepareQuotationDataForSave();
      console.log('Quotation data prepared for save:', quotationDataToSave);

      const updateData = {
        quotation_data: quotationDataToSave,
        status: 'completed',
        updated_at: new Date().toISOString()
      };

      console.log('Final update data being sent:', updateData);

      if (onUpdate) {
        console.log('Using parent onUpdate function');
        await onUpdate(updateData);
        console.log('Updated via parent onUpdate function successfully');
      } else {
        console.log('Using direct Supabase update');
        const { data, error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId)
          .select();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Updated proposal data from Supabase:', data);
      }

      toast({
        title: "Success",
        description: "Quotation saved successfully",
      });
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Error",
        description: `Failed to save quotation: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Starting save as draft process...');
    setLoading(true);
    
    try {
      const quotationDataToSave = prepareQuotationDataForSave();
      console.log('Draft data prepared for save:', quotationDataToSave);

      const updateData = {
        quotation_data: quotationDataToSave,
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('Draft update data being sent:', updateData);

      if (onUpdate) {
        console.log('Using parent onUpdate function for draft');
        await onUpdate(updateData);
      } else {
        console.log('Using direct Supabase update for draft');
        const { data, error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId)
          .select();

        if (error) {
          console.error('Supabase error saving draft:', error);
          throw error;
        }
        
        console.log('Saved draft data from Supabase:', data);
      }

      toast({
        title: "Success",
        description: "Quotation saved as draft",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: `Failed to save draft: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Quotation Information
              </h2>
              <p className="text-gray-600">معلومات عرض الأسعار - Add pricing and quotation details to your proposal</p>
            </div>
          </div>

          {/* Import Options */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Import className="h-5 w-5" />
                Import from Existing Quotation
              </CardTitle>
              <CardDescription>
                Use an existing quotation from the Quotation module or create a new one from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowSelectQuotationDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={savedQuotations.length === 0}
                  type="button"
                >
                  <FileText className="h-4 w-4" />
                  Select Existing Quotation ({savedQuotations.length} available)
                </Button>
                {importedQuotationNumber && (
                  <Badge variant="secondary" className="self-start">
                    Imported from: {importedQuotationNumber}
                  </Badge>
                )}
              </div>
              {savedQuotations.length === 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  No saved quotations found. Create quotations in the Quotation module first to import them here.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Details / تفاصيل العرض</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Services / الخدمات ({items.length} items)</CardTitle>
                <Button 
                  onClick={addItem}
                  type="button"
                  className="bg-smart-orange hover:bg-smart-orange/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              <CardDescription>
                Click "Add Service" to add unlimited services to your quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No services added yet. Click "Add Service" to get started or import from an existing quotation.
                  <br />
                  لم يتم إضافة أي خدمات بعد. انقر على "إضافة خدمة" للبدء أو استيراد من عرض أسعار موجود.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border rounded-lg bg-white shadow-sm">
                      <div className="lg:col-span-5">
                        <Label className="text-xs font-medium">Description / الوصف</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder={`Service ${index + 1} description... / وصف الخدمة ${index + 1}`}
                          rows={3}
                          className="text-sm mt-1"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-medium">Quantity / الكمية</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="text-sm mt-1"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-medium">Unit Price / سعر الوحدة</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="text-sm mt-1"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-medium">Total / المجموع</Label>
                        <Input
                          value={item.total.toFixed(2)}
                          readOnly
                          className="bg-gray-50 text-sm font-medium mt-1"
                        />
                      </div>
                      <div className="lg:col-span-1 flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={(e) => removeItem(item.id, e)}
                          className="text-red-600 hover:text-red-700 w-full"
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

          {/* Discount Section */}
          {items.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Percent className="h-5 w-5 mr-2" />
                  Discount & Tax / الخصم والضريبة
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                    <Label>VAT Rate (%) / معدل ضريبة القيمة المضافة</Label>
                    <Input
                      type="number"
                      value={quotationData.taxRate}
                      onChange={(e) => setQuotationData({...quotationData, taxRate: parseFloat(e.target.value) || 15})}
                      min="0"
                      max="100"
                      step="0.01"
                      className="text-sm"
                      placeholder="15"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Default: 15% (Saudi Arabia VAT rate)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Totals with proper VAT display */}
          {items.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>Pricing Summary / ملخص التسعير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                  <div className="flex justify-between text-sm">
                    <span>VAT ({quotationData.taxRate}%) / ضريبة القيمة المضافة:</span>
                    <span className="font-medium">{getCurrencySymbol()} {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-3">
                    <span>Grand Total / المجموع الكلي:</span>
                    <Badge variant="default" className="text-xl px-4 py-2">
                      {getCurrencySymbol()} {grandTotal.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information / معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="notes">Quotation Notes / ملاحظات العرض</Label>
                  <Textarea
                    id="notes"
                    value={quotationData.notes}
                    onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
                    placeholder="Any additional notes for this quotation... / أي ملاحظات إضافية لهذا العرض"
                    rows={4}
                    className="text-sm mt-2"
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
                    className="text-sm mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Buttons Section */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-lg">
            <Button 
              variant="outline" 
              type="button"
              onClick={handleSaveAsDraft}
              disabled={loading || externalLoading}
              className="min-w-[120px]"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button 
              type="button"
              className="bg-smart-orange hover:bg-smart-orange/90 min-w-[120px]"
              onClick={handleSaveQuotation}
              disabled={loading || externalLoading}
            >
              {loading ? 'Saving...' : 'Save Quotation'}
            </Button>
          </div>
        </div>
      </div>

      {/* Select Existing Quotation Dialog */}
      <SelectExistingQuotationDialog
        open={showSelectQuotationDialog}
        onOpenChange={setShowSelectQuotationDialog}
        onQuotationSelected={handleImportQuotation}
        savedQuotations={savedQuotations}
      />
    </div>
  );
};
