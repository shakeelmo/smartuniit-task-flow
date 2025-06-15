
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import QuotationsList from './quotations/QuotationsList';
import CreateQuotationDialog from './quotations/CreateQuotationDialog';
import EditQuotationDialog from './quotations/EditQuotationDialog';
import ExcelImportDialog from './quotations/ExcelImportDialog';
import { useToast } from '@/hooks/use-toast';
import { QuotationData } from '@/utils/pdfExport';

const QuotationManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importedQuotations, setImportedQuotations] = useState<QuotationData[]>([]);
  const { toast } = useToast();

  const handleCreateQuotation = () => {
    setShowCreateDialog(true);
  };

  const handleImportExcel = () => {
    setShowImportDialog(true);
  };

  const handleEditQuotation = (quotation: QuotationData) => {
    setEditingQuotation(quotation);
    setShowEditDialog(true);
  };

  const handleQuotationCreated = () => {
    setShowCreateDialog(false);
    toast({
      title: "Quotation Created",
      description: "New quotation has been created successfully.",
    });
  };

  const handleQuotationUpdated = () => {
    setShowEditDialog(false);
    setEditingQuotation(null);
    toast({
      title: "Quotation Updated",
      description: "Quotation has been updated successfully.",
    });
  };

  const handleQuotationsImported = (quotations: QuotationData[]) => {
    setImportedQuotations(prev => [...prev, ...quotations]);
    setShowImportDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">إدارة العروض والأسعار - Manage quotes and pricing</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleImportExcel} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={handleCreateQuotation} className="bg-smart-orange hover:bg-smart-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Display imported quotations count */}
      {importedQuotations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>{importedQuotations.length}</strong> quotation(s) imported from Excel. 
            You can now edit, export, or manage these quotations.
          </p>
        </div>
      )}

      <QuotationsList 
        searchTerm={searchTerm} 
        statusFilter={statusFilter} 
        onEditQuotation={handleEditQuotation}
        importedQuotations={importedQuotations}
      />

      <CreateQuotationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onQuotationCreated={handleQuotationCreated}
      />

      <EditQuotationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onQuotationUpdated={handleQuotationUpdated}
        quotationData={editingQuotation}
      />

      <ExcelImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onQuotationsImported={handleQuotationsImported}
      />
    </div>
  );
};

export default QuotationManagement;
