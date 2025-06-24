
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Download, Copy, MoreHorizontal } from 'lucide-react';
import { QuotationData } from '@/utils/pdf/types';

interface QuotationsListProps {
  searchTerm: string;
  statusFilter: string;
  onEditQuotation: (quotation: QuotationData) => void;
  importedQuotations: QuotationData[];
}

interface Quotation {
  id: string;
  number: string;
  customerName: string;
  date: string;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  salesRep: string;
}

const QuotationsList = ({ searchTerm, statusFilter, onEditQuotation, importedQuotations }: QuotationsListProps) => {
  // Mock data - in real app this would come from API
  const [quotations] = useState<Quotation[]>([
    {
      id: '1',
      number: 'QUO-2024-001',
      customerName: 'Saudi Telecom Company',
      date: '2024-01-15',
      total: 25000,
      status: 'sent',
      salesRep: 'Ahmed Al-Rashid'
    },
    {
      id: '2',
      number: 'QUO-2024-002',
      customerName: 'SABIC',
      date: '2024-01-18',
      total: 45000,
      status: 'approved',
      salesRep: 'Fatima Al-Zahra'
    },
    {
      id: '3',
      number: 'QUO-2024-003',
      customerName: 'Aramco Digital',
      date: '2024-01-20',
      total: 18500,
      status: 'draft',
      salesRep: 'Omar Al-Mansouri'
    }
  ]);

  // Convert imported quotations to display format
  const convertedImportedQuotations: Quotation[] = importedQuotations.map((q, index) => ({
    id: `imported_${index}`,
    number: q.number,
    customerName: q.customer.companyName,
    date: q.date.split('T')[0], // Extract date part
    total: q.total,
    status: 'draft' as const,
    salesRep: 'Imported'
  }));

  // Combine mock and imported quotations
  const allQuotations = [...quotations, ...convertedImportedQuotations];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      draft: 'Draft / مسودة',
      sent: 'Sent / مرسل',
      approved: 'Approved / معتمد',
      rejected: 'Rejected / مرفوض'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const filteredQuotations = allQuotations.filter(quotation => {
    const matchesSearch = quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (quotation: Quotation) => {
    // Check if this is an imported quotation
    const importedQuotation = importedQuotations.find(q => q.number === quotation.number);
    
    if (importedQuotation) {
      onEditQuotation(importedQuotation);
    } else {
      // Convert the mock quotation data to QuotationData format
      const quotationData: QuotationData = {
        number: quotation.number,
        date: quotation.date,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        customer: {
          companyName: quotation.customerName,
          contactName: '',
          phone: '',
          email: '',
          crNumber: '',
          vatNumber: ''
        },
        lineItems: [],
        subtotal: quotation.total * 0.87, // Approximate subtotal before VAT
        discount: 0,
        discountType: 'percentage',
        vat: quotation.total * 0.13, // Approximate VAT
        total: quotation.total,
        currency: 'SAR',
        customTerms: '',
        notes: ''
      };
      onEditQuotation(quotationData);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Quote Number</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Customer</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Date</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Total (SAR)</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Status</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900">Sales Rep</TableHead>
            <TableHead className="bg-gray-50 font-semibold text-gray-900 w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuotations.map((quotation) => (
            <TableRow key={quotation.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              <TableCell className="font-medium text-gray-900 bg-white">{quotation.number}</TableCell>
              <TableCell className="text-gray-900 bg-white">{quotation.customerName}</TableCell>
              <TableCell className="text-gray-900 bg-white">{new Date(quotation.date).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium text-gray-900 bg-white">
                ﷼ {quotation.total.toLocaleString()}
              </TableCell>
              <TableCell className="bg-white">{getStatusBadge(quotation.status)}</TableCell>
              <TableCell className="text-gray-900 bg-white">{quotation.salesRep}</TableCell>
              <TableCell className="bg-white">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                    <DropdownMenuItem className="hover:bg-gray-50">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(quotation)} className="hover:bg-gray-50">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-50">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsList;
