import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Download, Copy, MoreHorizontal, Send } from 'lucide-react';
import { InvoiceData } from '@/utils/pdf/invoiceTypes';
import { generateInvoicePDF } from '@/utils/invoicePdfExport';

interface InvoicesListProps {
  searchTerm: string;
  statusFilter: string;
  onEditInvoice: (invoice: InvoiceData) => void;
  importedInvoices: InvoiceData[];
}

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  salesRep: string;
}

const InvoicesList = ({ searchTerm, statusFilter, onEditInvoice, importedInvoices }: InvoicesListProps) => {
  // Mock data - in real app this would come from API
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      customerName: 'Saudi Telecom Company',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      total: 25000,
      status: 'sent',
      salesRep: 'Ahmed Al-Rashid'
    },
    {
      id: '2',
      number: 'INV-2024-002',
      customerName: 'SABIC',
      date: '2024-01-18',
      dueDate: '2024-02-18',
      total: 45000,
      status: 'paid',
      salesRep: 'Fatima Al-Zahra'
    },
    {
      id: '3',
      number: 'INV-2024-003',
      customerName: 'Aramco Digital',
      date: '2024-01-20',
      dueDate: '2024-01-20',
      total: 18500,
      status: 'overdue',
      salesRep: 'Omar Al-Mansouri'
    }
  ]);

  // Convert imported invoices to display format
  const convertedImportedInvoices: Invoice[] = importedInvoices.map((inv, index) => ({
    id: `imported_${index}`,
    number: inv.number,
    customerName: inv.customer.companyName,
    date: inv.date.split('T')[0],
    dueDate: inv.dueDate?.split('T')[0] || inv.date.split('T')[0],
    total: inv.total,
    status: 'draft' as const,
    salesRep: 'Imported'
  }));

  // Combine mock and imported invoices
  const allInvoices = [...invoices, ...convertedImportedInvoices];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      draft: 'Draft / مسودة',
      sent: 'Sent / مرسل',
      paid: 'Paid / مدفوع',
      overdue: 'Overdue / متأخر'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (invoice: Invoice) => {
    // Check if this is an imported invoice
    const importedInvoice = importedInvoices.find(inv => inv.number === invoice.number);
    
    if (importedInvoice) {
      onEditInvoice(importedInvoice);
    } else {
      // Convert the mock invoice data to InvoiceData format
      const invoiceData: InvoiceData = {
        number: invoice.number,
        date: invoice.date,
        dueDate: invoice.dueDate,
        customer: {
          companyName: invoice.customerName,
          contactName: '',
          phone: '',
          email: '',
          crNumber: '',
          vatNumber: ''
        },
        lineItems: [],
        subtotal: invoice.total * 0.87,
        discount: 0,
        discountType: 'percentage',
        vat: invoice.total * 0.13,
        total: invoice.total,
        currency: 'SAR',
        customTerms: '',
        notes: ''
      };
      onEditInvoice(invoiceData);
    }
  };

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      // Check if this is an imported invoice
      const importedInvoice = importedInvoices.find(inv => inv.number === invoice.number);
      
      let invoiceData: InvoiceData;
      
      if (importedInvoice) {
        invoiceData = importedInvoice;
      } else {
        // Convert the mock invoice data to InvoiceData format
        invoiceData = {
          number: invoice.number,
          date: invoice.date,
          dueDate: invoice.dueDate,
          customer: {
            companyName: invoice.customerName,
            contactName: '',
            phone: '',
            email: '',
            crNumber: '',
            vatNumber: ''
          },
          lineItems: [
            {
              id: '1',
              description: 'Service provided',
              quantity: 1,
              unitPrice: invoice.total * 0.87,
              total: invoice.total * 0.87
            }
          ],
          subtotal: invoice.total * 0.87,
          discount: 0,
          discountType: 'percentage',
          vat: invoice.total * 0.13,
          total: invoice.total,
          currency: 'SAR',
          customTerms: 'Payment due within 30 days of invoice date',
          notes: ''
        };
      }
      
      await generateInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error exporting invoice PDF:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Total (SAR)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales Rep</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.number}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">
                ﷼ {invoice.total.toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell>{invoice.salesRep}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportPDF(invoice)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
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

export default InvoicesList;
