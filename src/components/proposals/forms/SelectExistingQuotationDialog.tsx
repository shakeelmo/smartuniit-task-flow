
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, DollarSign, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ExistingQuotation {
  number: string;
  date: string;
  validUntil: string;
  currency: string;
  customer: {
    companyName: string;
  };
  lineItems: any[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  notes?: string;
  customTerms?: string;
}

interface SelectExistingQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationSelected: (quotation: ExistingQuotation) => void;
  savedQuotations: ExistingQuotation[];
}

export const SelectExistingQuotationDialog: React.FC<SelectExistingQuotationDialogProps> = ({
  open,
  onOpenChange,
  onQuotationSelected,
  savedQuotations
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotations = savedQuotations.filter(quotation =>
    quotation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuotation = (quotation: ExistingQuotation) => {
    onQuotationSelected(quotation);
    onOpenChange(false);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'SAR': return '﷼';
      default: return '$';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Existing Quotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search quotations by number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quotations List */}
          <ScrollArea className="flex-1">
            {filteredQuotations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No quotations found</p>
                <p className="text-sm mt-2">
                  {savedQuotations.length === 0 
                    ? "Create quotations in the Quotation module first" 
                    : "Try adjusting your search terms"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredQuotations.map((quotation) => (
                  <Card key={quotation.number} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleSelectQuotation(quotation)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{quotation.number}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Customer: {quotation.customer.companyName || 'No customer specified'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            {quotation.currency}
                          </Badge>
                          <div className="text-lg font-bold">
                            {getCurrencySymbol(quotation.currency)} {quotation.total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Created: {new Date(quotation.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>Items: {quotation.lineItems.length}</span>
                        </div>
                      </div>
                      {quotation.notes && (
                        <p className="text-sm text-gray-600 mt-2 truncate">
                          Notes: {quotation.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
