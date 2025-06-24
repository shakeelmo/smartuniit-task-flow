
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, File } from 'lucide-react';
import CustomerForm from './CustomerForm';
import QuotationSectionsManager from './QuotationSectionsManager';
import DiscountSection from './DiscountSection';
import TotalsSummary from './TotalsSummary';
import QuoteDetailsGrid from './QuoteDetailsGrid';

interface Props {
  customer: any;
  setCustomer: any;
  currency: any;
  setCurrency: any;
  validUntil: any;
  setValidUntil: any;
  quoteNumber: any;
  sections: any;
  setSections: any;
  discountType: any;
  setDiscountType: any;
  discount: any;
  setDiscount: any;
  calculateDiscountAmount: any;
  getCurrencySymbol: any;
  calculateSubtotal: any;
  calculateAfterDiscount: any;
  calculateVAT: any;
  calculateTotal: any;
  customTerms: string;
  setCustomTerms: (t: string) => void;
  notes: string;
  setNotes: (t: string) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onExportWord?: () => void;
  isExporting: boolean;
  onOpenChange: (open: boolean) => void;
  customerType?: 'existing' | 'new';
  setCustomerType?: (type: 'existing' | 'new') => void;
  showUnitColumn: boolean;
  setShowUnitColumn: (show: boolean) => void;
}

const CreateQuotationDialogContent: React.FC<Props> = ({
  customer, setCustomer,
  currency, setCurrency,
  validUntil, setValidUntil,
  quoteNumber,
  sections, setSections,
  discountType, setDiscountType,
  discount, setDiscount,
  calculateDiscountAmount,
  getCurrencySymbol,
  calculateSubtotal,
  calculateAfterDiscount,
  calculateVAT,
  calculateTotal,
  customTerms, setCustomTerms,
  notes, setNotes,
  onSave,
  onExportPDF,
  onExportWord,
  isExporting,
  onOpenChange,
  customerType,
  setCustomerType,
  showUnitColumn,
  setShowUnitColumn
}) => (
  <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">
        Create New Quotation / إنشاء عرض سعر جديد
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6">
      <CustomerForm 
        customer={customer} 
        setCustomer={setCustomer}
        customerType={customerType}
        setCustomerType={setCustomerType}
      />
      <QuoteDetailsGrid
        currency={currency}
        setCurrency={setCurrency}
        validUntil={validUntil}
        setValidUntil={setValidUntil}
        quoteNumber={quoteNumber}
      />
      <div>
        <h3 className="text-lg font-semibold mb-4">Services & Infrastructure / الخدمات والبنية التحتية</h3>
        <QuotationSectionsManager
          sections={sections}
          setSections={setSections}
          showUnitColumn={showUnitColumn}
          setShowUnitColumn={setShowUnitColumn}
        />
      </div>
      <DiscountSection
        discountType={discountType}
        setDiscountType={setDiscountType}
        discount={discount}
        setDiscount={setDiscount}
        currency={currency}
        calculateDiscountAmount={calculateDiscountAmount}
        getCurrencySymbol={getCurrencySymbol}
      />
      <TotalsSummary
        calculateSubtotal={calculateSubtotal}
        calculateDiscountAmount={calculateDiscountAmount}
        calculateAfterDiscount={calculateAfterDiscount}
        calculateVAT={calculateVAT}
        calculateTotal={calculateTotal}
        getCurrencySymbol={getCurrencySymbol}
      />
      <div>
        <label htmlFor="customTerms">Terms and Conditions / الشروط والأحكام</label>
        <textarea
          id="customTerms"
          value={customTerms}
          onChange={e => setCustomTerms(e.target.value)}
          rows={6}
          className="font-mono text-sm w-full border rounded"
        />
      </div>
      <div>
        <label htmlFor="notes">Additional Notes / ملاحظات إضافية</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full border rounded"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-smart-orange hover:bg-smart-orange/90">
          Save Quotation
        </Button>
        <Button
          onClick={onExportPDF}
          variant="outline"
          className="bg-smart-blue text-white hover:bg-smart-blue/90"
          disabled={isExporting}
          type="button"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        {onExportWord && (
          <Button
            onClick={onExportWord}
            variant="outline"
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={isExporting}
            type="button"
          >
            <File className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export as Word'}
          </Button>
        )}
      </div>
    </div>
  </DialogContent>
);

export default CreateQuotationDialogContent;
