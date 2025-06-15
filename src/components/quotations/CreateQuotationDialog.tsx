import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Save, FileText } from 'lucide-react';
import CustomerForm from './CustomerForm';
import LineItemsTable from './LineItemsTable';
import { generateQuotationPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface CreateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationCreated: () => void;
}

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

const CreateQuotationDialog = ({ open, onOpenChange, onQuotationCreated }: CreateQuotationDialogProps) => {
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
  const [customTerms, setCustomTerms] = useState(`• Payment: 100%
• All prices in Saudi Riyals
• Delivery– 1 Week after PO
• Offers will be confirmed based on your purchase order.
• Product availability and prices are subject to change without notice`);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const VAT_RATE = 0.15; // 15% VAT rate for Saudi Arabia

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * VAT_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const getCurrencySymbol = () => {
    return currency === 'SAR' ? '﷼' : '$';
  };

  const getCurrencyName = () => {
    return currency === 'SAR' ? 'Saudi Riyals' : 'US Dollars';
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

  const generateQuoteNumber = () => {
    return `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  };

  const handleSave = () => {
    // In real app, this would save to database
    console.log('Saving quotation:', {
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes,
      validUntil
    });
    onQuotationCreated();
  };

  const handleExportPDF = async () => {
    console.log('[Export PDF] Button clicked');

    toast({ title: "Export button clicked", description: "Starting PDF generation attempt.", variant: "default" });

    if (!customer.companyName.trim()) {
      toast({ title: "Missing Info", description: "Please enter a company name before exporting PDF", variant: "destructive" });
      console.log('[Export PDF] Missing company name!');
      return;
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.service.trim())) {
      toast({ title: "No Services", description: "Please add at least one service item before exporting PDF", variant: "destructive" });
      console.log('[Export PDF] No line items!');
      return;
    }

    if (calculateTotal() === 0) {
      toast({ title: "Total is zero", description: "Please enter item(s) with a quantity and unit price to calculate total before export.", variant: "destructive" });
      console.log('[Export PDF] Total is zero!');
      return;
    }

    setIsExporting(true);

    const quotationData = {
      number: generateQuoteNumber(),
      date: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer,
      lineItems,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      currency,
      customTerms,
      notes
    };

    console.log('[Export PDF] Calling generateQuotationPDF', quotationData);

    toast({ title: "Calling PDF exporter", description: "generateQuotationPDF will be invoked", variant: "default" });

    try {
      const success = await generateQuotationPDF(quotationData);
      console.log('[Export PDF] generateQuotationPDF returned:', success);

      if (success) {
        toast({ title: "PDF Exported", description: "PDF exported successfully!", variant: "default" });
      } else {
        toast({ title: "Export Failed", description: "PDF was not generated for unknown reasons.", variant: "destructive" });
      }
    } catch (error) {
      console.error('[Export PDF] Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: "Failed to export PDF", description: errorMessage, variant: "destructive" });
    } finally {
      setIsExporting(false);
      toast({ title: "Export Complete", description: "Export attempt finished.", variant: "default" });
      console.log('[Export PDF] Export process completed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Quotation / إنشاء عرض سعر جديد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
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
                  value={generateQuoteNumber()}
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

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal / المجموع الفرعي:</span>
                <span className="font-medium">{getCurrencySymbol()} {calculateSubtotal().toLocaleString()}</span>
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
              Save Quotation
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

export default CreateQuotationDialog;
