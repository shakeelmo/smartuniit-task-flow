
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
  [key: string]: any;
}

const ExcelImportDialog = ({ open, onOpenChange, onQuotationsImported }: ExcelImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ExcelRow[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const { toast } = useToast();

  const normalizeColumnName = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const mapColumnName = (originalName: string): string => {
    const normalized = normalizeColumnName(originalName);
    
    // Mapping variations to standard field names
    const mappings: { [key: string]: string } = {
      // Customer variations
      'customer': 'customerName',
      'customername': 'customerName',
      'company': 'customerName',
      'companyname': 'customerName',
      'client': 'customerName',
      'clientname': 'customerName',
      
      // Contact variations
      'contact': 'contactName',
      'contactname': 'contactName',
      'contactperson': 'contactName',
      'person': 'contactName',
      
      // Phone variations
      'phone': 'phone',
      'phonenumber': 'phone',
      'mobile': 'phone',
      'tel': 'phone',
      'telephone': 'phone',
      
      // Email variations
      'email': 'email',
      'emailaddress': 'email',
      'mail': 'email',
      
      // Service variations
      'service': 'service',
      'servicename': 'service',
      'product': 'service',
      'productname': 'service',
      'item': 'service',
      'itemname': 'service',
      
      // Description variations
      'description': 'description',
      'desc': 'description',
      'details': 'description',
      
      // Part number variations
      'partnumber': 'partNumber',
      'partno': 'partNumber',
      'sku': 'partNumber',
      'code': 'partNumber',
      'productcode': 'partNumber',
      
      // Quantity variations
      'quantity': 'quantity',
      'qty': 'quantity',
      'amount': 'quantity',
      'count': 'quantity',
      
      // Unit price variations
      'unitprice': 'unitPrice',
      'price': 'unitPrice',
      'rate': 'unitPrice',
      'cost': 'unitPrice',
      
      // Currency variations
      'currency': 'currency',
      'curr': 'currency',
      
      // CR Number variations
      'crnumber': 'crNumber',
      'cr': 'crNumber',
      'commercialregistration': 'crNumber',
      
      // VAT Number variations
      'vatnumber': 'vatNumber',
      'vat': 'vatNumber',
      'taxnumber': 'vatNumber',
      
      // Valid until variations
      'validuntil': 'validUntil',
      'expiry': 'validUntil',
      'expirydate': 'validUntil',
      'validdate': 'validUntil',
      
      // Notes variations
      'notes': 'notes',
      'note': 'notes',
      'comments': 'notes',
      'comment': 'notes',
      'remarks': 'notes'
    };

    return mappings[normalized] || originalName;
  };

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
      
      console.log('Raw Excel data:', jsonData);
      
      if (jsonData.length > 0) {
        const headers = Object.keys(jsonData[0]);
        setDetectedHeaders(headers);
        console.log('Detected headers:', headers);
        
        // Map the column names and show preview
        const mappedData = jsonData.slice(0, 5).map(row => {
          const mappedRow: any = {};
          Object.keys(row).forEach(key => {
            const mappedKey = mapColumnName(key);
            mappedRow[mappedKey] = row[key];
          });
          return mappedRow;
        });
        
        console.log('Mapped preview data:', mappedData);
        setPreview(mappedData);
      }
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
    console.log('Processing Excel data:', data);
    
    // Map column names first
    const mappedData = data.map(row => {
      const mappedRow: any = {};
      Object.keys(row).forEach(key => {
        const mappedKey = mapColumnName(key);
        mappedRow[mappedKey] = row[key];
      });
      return mappedRow;
    });
    
    console.log('Mapped data for processing:', mappedData);
    
    const quotationsMap = new Map<string, QuotationData>();

    mappedData.forEach((row, index) => {
      console.log(`Processing row ${index}:`, row);
      
      // Try to find customer name in various possible fields
      const customerName = row.customerName || row.customer || row.company || row.companyName || row.client || row.clientName;
      
      if (!customerName) {
        console.log(`Skipping row ${index} - no customer name found`);
        return;
      }

      const customerId = customerName.toString().toLowerCase().replace(/\s+/g, '_');
      
      if (!quotationsMap.has(customerId)) {
        // Create new quotation
        const newQuotation: QuotationData = {
          number: `QUO-${new Date().getFullYear()}-${String(Date.now() + index).slice(-4)}`,
          date: new Date().toISOString(),
          validUntil: row.validUntil ? new Date(row.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          customer: {
            companyName: customerName.toString(),
            contactName: row.contactName?.toString() || '',
            phone: row.phone?.toString() || '',
            email: row.email?.toString() || '',
            crNumber: row.crNumber?.toString() || '',
            vatNumber: row.vatNumber?.toString() || ''
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
          notes: row.notes?.toString() || ''
        };
        
        quotationsMap.set(customerId, newQuotation);
        console.log(`Created new quotation for ${customerName}:`, newQuotation);
      }

      // Add line item if service/product is provided
      const service = row.service || row.product || row.item || row.serviceName || row.productName || row.itemName;
      if (service) {
        const quotation = quotationsMap.get(customerId)!;
        const lineItem = {
          id: `${customerId}_${quotation.lineItems.length + 1}`,
          service: service.toString(),
          description: row.description?.toString() || '',
          partNumber: row.partNumber?.toString() || '',
          quantity: Number(row.quantity) || 1,
          unitPrice: Number(row.unitPrice) || 0
        };
        
        quotation.lineItems.push(lineItem);
        console.log(`Added line item to ${customerName}:`, lineItem);
      }
    });

    // Calculate totals for each quotation
    const quotations = Array.from(quotationsMap.values());
    quotations.forEach(quotation => {
      quotation.subtotal = quotation.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      quotation.vat = quotation.subtotal * 0.15; // 15% VAT
      quotation.total = quotation.subtotal + quotation.vat;
    });

    console.log('Final processed quotations:', quotations);
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

      console.log('Starting import process with data:', jsonData);

      const quotations = processExcelData(jsonData);

      if (quotations.length === 0) {
        toast({
          title: "No valid data",
          description: `No valid quotation data found. Please ensure your Excel file has at least a customer name column. Detected headers: ${detectedHeaders.join(', ')}`,
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
      setDetectedHeaders([]);
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

            {/* Detected Headers */}
            {detectedHeaders.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Detected Headers / العناوين المكتشفة</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Found columns:</strong> {detectedHeaders.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Expected Format Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Expected Excel Format / التنسيق المتوقع لملف إكسل
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Required:</strong> Customer name (can be: Customer, Company, Client, etc.)</p>
                <p><strong>Optional:</strong> Contact, Phone, Email, Service/Product, Description, Part Number, Quantity, Unit Price, Currency, etc.</p>
                <p><strong>Note:</strong> Column names are flexible - we'll try to match common variations automatically.</p>
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
                        <td className="border border-gray-300 p-2">{row.customerName || row.customer || row.company || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.contactName || row.contact || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.service || row.product || row.item || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.quantity || '-'}</td>
                        <td className="border border-gray-300 p-2">{row.unitPrice || row.price || '-'}</td>
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
