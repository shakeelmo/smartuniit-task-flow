
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Save, FileText, Percent } from 'lucide-react';
import CustomerForm from './CustomerForm';
import LineItemsTable from './LineItemsTable';
import { generateQuotationPDF, QuotationData } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id: string;
  service: string;
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

interface Customer {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  crNumber: string;
  vatNumber: string;
}

interface EditQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationUpdated: () => void;
  quotationData?: QuotationData | null;
}

const EditQuotationDialog = ({ open, onOpenChange, onQuotationUpdated, quotationData }: EditQuotationDialogProps) => {
  const [customer, setCustomer] = useState<Customer>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    crNumber: '',
    vatNumber: ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', service: '', description: '', partNumber: '', quantity: 1, unitPrice: 0 }
  ]);

  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [currency, setCurrency] = useState<'SAR' | 'USD'>('SAR');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [customTerms, setCustomTerms] = useState(`• Payment: 100%
• All prices in Saudi Riyals
• Delivery– 1 Week after PO
• Offers will be confirmed based on your purchase order.
• Product availability and prices are subject to change without notice`);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const VAT_RATE = 0.15;

  // Load existing quotation data when dialog opens
  useEffect(() => {
    if (quotationData && open) {
      setCustomer(quotationData.customer);
      setLineItems(quotationData.lineItems.map(item => ({
        id: item.id || Date.now().toString(),
        service: item.service,
        description: item.description,
        partNumber: item.partNumber || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })));
      setNotes(quotationData.notes);
      setValidUntil(quotationData.validUntil.split('T')[0]); // Convert to date format
      setCurrency(quotationData.currency);
      setDiscount(quotationData.discount || 0);
      setDiscountType(quotationData.discountType || 'percentage');
      setCustomTerms(quotationData.customTerms);
    }
  }, [quotationData, open]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discount / 100);
    }
    return discount;
  };

  const calculateAfterDiscount = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const calculateVAT = () => {
    return calculateAfterDiscount() * VAT_RATE;
  };

  const calculateTotal = () => {
    return calculateAfterDiscount() + calculateVAT();
  };

  const getCurrencySymbol = () => {
    return currency === 'SAR' ? '﷼' : '$';
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      service: '',
      description: '',
      partNumber: '',
      quantity: 1,
      unitPrice: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    console.log('Updating quotation:', {
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes,
      validUntil
    });
    onQuotationUpdated();
  };

  const handleExportPDF = async () => {
    if (!customer.companyName.trim()) {
      toast({ title: "Missing Info", description: "Please enter a company name before exporting PDF", variant: "destructive" });
      return;
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.service.trim())) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting PDF", variant: "destructive" });
      return;
    }

    setIsExporting(true);

    const quotationDataForPDF: QuotationData = {
      number: quotationData?.number || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      date: quotationData?.date || new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscountAmount(),
      discountType,
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes
    };

    try {
      const success = await generateQuotationPDF(quotationDataForPDF);
      if (success) {
        toast({ title: "PDF Exported", description: "PDF exported successfully!", variant: "default" });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: "Failed to export PDF", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const isEditMode = !!quotationData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? 'Edit Quotation' : 'Create New Quotation'} / {isEditMode ? 'تعديل عرض السعر' : 'إنشاء عرض سعر جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <CustomerForm customer={customer} setCustomer={setCustomer} />

          {/* Quote Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quote Details / تفاصيل العرض</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency">Currency / العملة</Label>
                <Select value={currency} onValueChange={(value: 'SAR' | 'USD') => setCurrency(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR (﷼) - Saudi Riyal</SelectItem>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until / صالح حتى</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quoteNumber">Quote Number / رقم العرض</Label>
                <Input
                  id="quoteNumber"
                  value={quotationData?.number || `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Services / الخدمات</h3>
              <Button onClick={addLineItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <LineItemsTable
              lineItems={lineItems}
              updateLineItem={updateLineItem}
              removeLineItem={removeLineItem}
            />
          </div>

          {/* Discount Section */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Percent className="h-5 w-5 mr-2" />
              Discount / الخصم
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type / نوع الخصم</Label>
                <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%) / نسبة مئوية</SelectItem>
                    <SelectItem value="fixed">Fixed Amount / مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount">
                  {discountType === 'percentage' ? 'Discount (%) / نسبة الخصم' : `Discount Amount (${currency}) / مبلغ الخصم`}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  step={discountType === 'percentage' ? 0.1 : 0.01}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <div>Discount Amount: {getCurrencySymbol()} {calculateDiscountAmount().toLocaleString()}</div>
                  <div>مبلغ الخصم</div>
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal / المجموع الفرعي:</span>
                <span className="font-medium">{getCurrencySymbol()} {calculateSubtotal().toLocaleString()}</span>
              </div>
              {calculateDiscountAmount() > 0 && (
                <div className="flex justify-between text-yellow-600">
                  <span>Discount / الخصم:</span>
                  {/* Removed the negative sign here */}
                  <span className="font-medium">{getCurrencySymbol()} {calculateDiscountAmount().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>After Discount / بعد الخصم:</span>
                <span className="font-medium">{getCurrencySymbol()} {calculateAfterDiscount().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%) / ضريبة القيمة المضافة:</span>
                <span className="font-medium">{getCurrencySymbol()} {calculateVAT().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total / المجموع الكلي:</span>
                <span>{getCurrencySymbol()} {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <Label htmlFor="customTerms">Terms and Conditions / الشروط والأحكام</Label>
            <Textarea
              id="customTerms"
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              placeholder="Enter terms and conditions..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes / ملاحظات إضافية</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-smart-orange hover:bg-smart-orange/90">
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Quotation' : 'Save Quotation'}
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="bg-smart-blue text-white hover:bg-smart-blue/90"
              disabled={isExporting}
              type="button"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuotationDialog;
