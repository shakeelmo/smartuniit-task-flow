
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { CreateVendorDialog } from '@/components/vendors/CreateVendorDialog';
import { EditVendorDialog } from '@/components/vendors/EditVendorDialog';
import { DeleteVendorDialog } from '@/components/vendors/DeleteVendorDialog';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';
import { Vendor } from '@/types/vendor';

const VendorManagement = () => {
  const { vendors, loading } = useVendors();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeleteingVendor] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter(vendor =>
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600">Manage your vendors and suppliers</p>
        </div>
        <PermissionGuard module="vendors" permission="create">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </PermissionGuard>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{vendor.vendor_name}</CardTitle>
                  {vendor.company_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-3 w-3 mr-1" />
                      {vendor.company_name}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {vendor.contact_person && (
                <div className="text-sm text-gray-600">
                  Contact: {vendor.contact_person}
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3 w-3 mr-1" />
                  {vendor.email}
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {vendor.phone}
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {vendor.address}
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-3">
                <PermissionGuard module="vendors" permission="update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    Edit
                  </Button>
                </PermissionGuard>
                <PermissionGuard module="vendors" permission="delete">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteingVendor(vendor)}
                  >
                    Delete
                  </Button>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No vendors found matching your search.' : 'No vendors yet. Create your first vendor to get started.'}
            </p>
          </CardContent>
        </Card>
      )}

      <CreateVendorDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {editingVendor && (
        <EditVendorDialog
          vendor={editingVendor}
          open={true}
          onOpenChange={(open) => !open && setEditingVendor(null)}
        />
      )}

      {deletingVendor && (
        <DeleteVendorDialog
          vendor={deletingVendor}
          open={true}
          onOpenChange={(open) => !open && setDeleteingVendor(null)}
        />
      )}
    </div>
  );
};

export default VendorManagement;
