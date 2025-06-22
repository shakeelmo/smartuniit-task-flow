
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Mail, Phone, MapPin, Search, Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types/customer';
import { EditCustomerDialog } from './EditCustomerDialog';

interface CustomersListProps {
  searchTerm: string;
  statusFilter: string;
  onEditCustomer?: (customer: Customer) => void;
  onCreateFollowUp?: (customerId: string) => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({
  searchTerm,
  statusFilter,
  onEditCustomer,
  onCreateFollowUp
}) => {
  const { customers, loading, deleteCustomer } = useCustomers();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditDialog(true);
    if (onEditCustomer) {
      onEditCustomer(customer);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.customer_name}?`)) {
      await deleteCustomer(customer.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-purple-100 text-purple-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredCustomers.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first customer'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{customer.customer_name}</CardTitle>
                  {customer.company_name && (
                    <p className="text-sm text-gray-600 mt-1">{customer.company_name}</p>
                  )}
                </div>
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.contact_person && (
                  <p className="text-sm text-gray-600">
                    Contact: {customer.contact_person}
                  </p>
                )}
                
                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>

                {customer.industry && (
                  <p className="text-sm text-gray-600">
                    Industry: {customer.industry}
                  </p>
                )}

                {customer.project_interest && (
                  <p className="text-sm text-gray-600">
                    Interest: {customer.project_interest}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  {onCreateFollowUp && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateFollowUp(customer.id)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Follow-up
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingCustomer && (
        <EditCustomerDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          customer={editingCustomer}
          onCustomerUpdated={() => {
            setShowEditDialog(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </>
  );
};
