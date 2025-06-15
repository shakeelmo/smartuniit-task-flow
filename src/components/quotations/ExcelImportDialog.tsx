
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { QuotationData } from '@/utils/pdfExport';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationsImported: (quotations: QuotationData[]) => void;
}

interface ExcelRow {
  customerName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  crNumber?: string;
  vatNumber?: string;
  service?: string;
  description?: string;
  partNumber?: string;
  quantity?: number;
  unitPrice?: number;
  validUntil?: string;
  currency?: string;
  notes?: string;
}

const ExcelImportDialog = ({ open, onOpenChange, onQuotationsImported }: ExcelImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
      
      setPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read Excel file. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const processExcelData = (data: ExcelRow[]): QuotationData[] => {
    const quotationsMap = new Map<string, QuotationData>();

    data.forEach((row, index) => {
      if (!row.customerName) return;

      const customerId = row.customerName.toLowerCase().replace(/\s+/g, '_');
      
      if (!quotationsMap.has(customerId)) {
        // Create new quotation
        quotationsMap.set(customerId, {
          number: `QUO-${new Date().getFullYear()}-${String(Date.now() + index).slice(-4)}`,
          date: new Date().toISOString(),
          validUntil: row.validUntil ? new Date(row.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          customer: {
            companyName: row.customerName || '',
            contactName: row.contactName || '',
            phone: row.phone || '',
            email: row.email || '',
            crNumber: row.crNumber || '',
            vatNumber: row.vatNumber || ''
          },
          lineItems: [],
          subtotal: 0,
          discount: 0,
          discountType: 'percentage' as const,
          vat: 0,
          total: 0,
          currency: (row.currency === 'USD' ? 'USD' : 'SAR') as 'SAR' | 'USD',
          customTerms: `• Payment: 100%
• All prices in ${row.currency === 'USD' ? 'US Dollars' : 'Saudi Riyals'}
• Delivery– 1 Week after PO
• Offers will be confirmed based on your purchase order.
• Product availability and prices are subject to change without notice`,
          notes: row.notes || ''
        });
      }

      // Add line item if service is provided
      if (row.service) {
        const quotation = quotationsMap.get(customerId)!;
        quotation.lineItems.push({
          id: `${customerId}_${quotation.lineItems.length + 1}`,
          service: row.service,
          description: row.description || '',
          partNumber: row.partNumber || '',
          quantity: row.quantity || 1,
          unitPrice: row.unitPrice || 0
        });
      }
    });

    // Calculate totals for each quotation
    const quotations = Array.from(quotationsMap.values());
    quotations.forEach(quotation => {
      quotation.subtotal = quotation.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      quotation.vat = quotation.subtotal * 0.15; // 15% VAT
      quotation.total = quotation.subtotal + quotation.vat;
    });

    return quotations;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to import.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

      const quotations = processExcelData(jsonData);

      if (quotations.length === 0) {
        toast({
          title: "No valid data",
          description: "No valid quotation data found in the Excel file.",
          variant: "destructive"
        });
        return;
      }

      onQuotationsImported(quotations);
      toast({
        title: "Import successful",
        description: `Successfully imported ${quotations.length} quotation(s).`,
        variant: "default"
      });
      
      onOpenChange(false);
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Import failed",
        description: "Failed to process Excel file. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Import Excel File / استيراد ملف إكسل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="excelFile">Select Excel File / اختر ملف إكسل</Label>
              <Input
                id="excelFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            {/* Expected Format Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Expected Excel Format / التنسيق المتوقع لملف إكسل
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Required columns:</strong> customerName</p>
                <p><strong>Optional columns:</strong> contactName, phone, email, crNumber, vatNumber, service, description, partNumber, quantity, unitPrice, validUntil, currency, notes</p>
                <p><strong>Notes:</strong> Multiple rows with the same customerName will be grouped into one quotation with multiple line items.</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Preview (First 5 rows) / معاينة (أول 5 صفوف)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2">Customer</th>
                      <th className="border border-gray-300 p-2">Contact</th>
                      <th className="border border-gray-300 p-2">Service</th>
                      <th className="border border-gray-300 p-2">Quantity</th>
                      <th className="border border-gray-300 p-2">Unit Price</th>
                      <th className="border border-gray-300 p-2">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{row.customerName || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.contactName || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.service || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.quantity || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.unitPrice || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.currency || 'SAR'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isProcessing}
              className="bg-smart-orange hover:bg-smart-orange/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Import Quotations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;
