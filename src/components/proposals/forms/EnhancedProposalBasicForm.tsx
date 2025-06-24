
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Save, Building, User, Phone, Mail, MapPin, Calendar, FileText, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomerLogoUpload } from '../CustomerLogoUpload';
import { useCustomers } from '@/hooks/useCustomers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedProposalBasicFormProps {
  proposal: any;
  onUpdate: (data: any) => void;
  loading: boolean;
}

export const EnhancedProposalBasicForm: React.FC<EnhancedProposalBasicFormProps> = ({
  proposal,
  onUpdate,
  loading
}) => {
  const { customers, loading: customersLoading } = useCustomers();
  const [formData, setFormData] = useState({
    title: proposal?.title || '',
    project_name: proposal?.project_name || '',
    reference_number: proposal?.reference_number || '',
    client_company_name: proposal?.client_company_name || '',
    client_contact_person: proposal?.client_contact_person || '',
    client_email: proposal?.client_email || '',
    client_phone: proposal?.client_phone || '',
    client_address: proposal?.client_address || '',
    company_name: proposal?.company_name || 'Smart Universe for Communication & IT',
    company_contact_details: proposal?.company_contact_details || 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295',
    submission_date: proposal?.submission_date ? new Date(proposal.submission_date) : null,
    customer_logo_url: proposal?.customer_logo_url || null,
    customer_id: proposal?.customer_id || '',
    duration_of_project: proposal?.duration_of_project || '',
    table_of_contents: proposal?.table_of_contents || false
  });

  // Update form data when proposal changes
  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title || '',
        project_name: proposal.project_name || '',
        reference_number: proposal.reference_number || '',
        client_company_name: proposal.client_company_name || '',
        client_contact_person: proposal.client_contact_person || '',
        client_email: proposal.client_email || '',
        client_phone: proposal.client_phone || '',
        client_address: proposal.client_address || '',
        company_name: proposal.company_name || 'Smart Universe for Communication & IT',
        company_contact_details: proposal.company_contact_details || 'Office # 3 in, Al Dirah Dist, P.O Box 12633, Riyadh - 11461 KSA Tel: 011-4917295',
        submission_date: proposal.submission_date ? new Date(proposal.submission_date) : null,
        customer_logo_url: proposal.customer_logo_url || null,
        customer_id: proposal.customer_id || '',
        duration_of_project: proposal.duration_of_project || '',
        table_of_contents: proposal.table_of_contents || false
      });
    }
  }, [proposal]);

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      submission_date: formData.submission_date ? format(formData.submission_date, 'yyyy-MM-dd') : null,
      duration_of_project: formData.duration_of_project ? parseInt(formData.duration_of_project) : null
    };
    
    console.log('Saving proposal data:', dataToSave);
    onUpdate(dataToSave);
  };

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      const updatedData = {
        ...formData,
        customer_id: customerId,
        client_company_name: selectedCustomer.company_name || selectedCustomer.customer_name,
        client_contact_person: selectedCustomer.contact_person || '',
        client_email: selectedCustomer.email || '',
        client_phone: selectedCustomer.phone || '',
        client_address: selectedCustomer.address || ''
      };
      setFormData(updatedData);
    } else {
      handleInputChange('customer_id', customerId);
    }
  };

  const handleLogoChange = (logoUrl: string | null) => {
    console.log('Logo changed:', logoUrl);
    handleInputChange('customer_logo_url', logoUrl);
    
    // Auto-save the logo immediately
    const dataToSave = {
      ...formData,
      customer_logo_url: logoUrl,
      submission_date: formData.submission_date ? format(formData.submission_date, 'yyyy-MM-dd') : null,
      duration_of_project: formData.duration_of_project ? parseInt(formData.duration_of_project) : null
    };
    
    console.log('Auto-saving logo data:', dataToSave);
    onUpdate(dataToSave);
  };

  return (
    <div className="space-y-6">
      {/* Proposal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Proposal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter proposal title"
                required
              />
            </div>
            <div>
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleInputChange('project_name', e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => handleInputChange('reference_number', e.target.value)}
                placeholder="REF-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="duration_of_project">Project Duration (Days)</Label>
              <Input
                id="duration_of_project"
                type="number"
                value={formData.duration_of_project}
                onChange={(e) => handleInputChange('duration_of_project', e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="submission_date">Submission Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.submission_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.submission_date ? format(formData.submission_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.submission_date}
                    onSelect={(date) => handleInputChange('submission_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="table_of_contents"
                checked={formData.table_of_contents}
                onChange={(e) => handleInputChange('table_of_contents', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="table_of_contents">Include Table of Contents in PDF</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_id">Select Existing Customer (Optional)</Label>
              <Select value={formData.customer_id} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer or enter manually below" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None - Enter manually</SelectItem>
                  {!customersLoading && customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name || customer.customer_name} 
                      {customer.contact_person && ` - ${customer.contact_person}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_company_name">Company Name</Label>
              <Input
                id="client_company_name"
                value={formData.client_company_name}
                onChange={(e) => handleInputChange('client_company_name', e.target.value)}
                placeholder="Client company name"
              />
            </div>
            <div>
              <Label htmlFor="client_contact_person">Contact Person</Label>
              <Input
                id="client_contact_person"
                value={formData.client_contact_person}
                onChange={(e) => handleInputChange('client_contact_person', e.target.value)}
                placeholder="Contact person name"
              />
            </div>
            <div>
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Phone</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
                placeholder="+966 50 123 4567"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="client_address">Address</Label>
            <Textarea
              id="client_address"
              value={formData.client_address}
              onChange={(e) => handleInputChange('client_address', e.target.value)}
              placeholder="Client address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Logo Upload */}
      <CustomerLogoUpload
        currentLogoUrl={formData.customer_logo_url}
        onLogoChange={handleLogoChange}
      />

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Our Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div>
            <Label htmlFor="company_contact_details">Contact Details</Label>
            <Textarea
              id="company_contact_details"
              value={formData.company_contact_details}
              onChange={(e) => handleInputChange('company_contact_details', e.target.value)}
              placeholder="Your company contact information"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
