
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Download, Copy, MoreHorizontal } from 'lucide-react';

interface QuotationsListProps {
  searchTerm: string;
  statusFilter: string;
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

const QuotationsList = ({ searchTerm, statusFilter }: QuotationsListProps) => {
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quote Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total (SAR)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales Rep</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuotations.map((quotation) => (
            <TableRow key={quotation.id}>
              <TableCell className="font-medium">{quotation.number}</TableCell>
              <TableCell>{quotation.customerName}</TableCell>
              <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">
                ﷼ {quotation.total.toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(quotation.status)}</TableCell>
              <TableCell>{quotation.salesRep}</TableCell>
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
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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

export default QuotationsList;
