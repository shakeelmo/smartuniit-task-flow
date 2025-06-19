
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProposalBasicFormProps {
  proposal: any;
  onUpdate: (data: any) => Promise<void>;
  loading: boolean;
}

export const ProposalBasicForm: React.FC<ProposalBasicFormProps> = ({
  proposal,
  onUpdate,
  loading
}) => {
  const [formData, setFormData] = useState({
    title: proposal?.title || '',
    status: proposal?.status || 'draft',
    project_name: proposal?.project_name || '',
    reference_number: proposal?.reference_number || '',
    client_company_name: proposal?.client_company_name || '',
    client_address: proposal?.client_address || '',
    client_contact_person: proposal?.client_contact_person || '',
    client_email: proposal?.client_email || '',
    client_phone: proposal?.client_phone || '',
    company_name: proposal?.company_name || '',
    company_contact_details: proposal?.company_contact_details || '',
    submission_date: proposal?.submission_date || '',
    executive_summary: proposal?.executive_summary || '',
    key_objectives: proposal?.key_objectives || '',
    why_choose_us: proposal?.why_choose_us || '',
    problem_description: proposal?.problem_description || '',
    background_context: proposal?.background_context || '',
    proposed_solution: proposal?.proposed_solution || '',
    strategy_method: proposal?.strategy_method || '',
    company_bio: proposal?.company_bio || '',
    terms_conditions: proposal?.terms_conditions || '',
    call_to_action: proposal?.call_to_action || 'Contact Us'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  return (
    <ScrollArea className="max-h-[60vh]">
      <form onSubmit={handleSubmit} className="space-y-6 pr-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Proposal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleChange('project_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => handleChange('reference_number', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_company_name">Client Company Name</Label>
              <Input
                id="client_company_name"
                value={formData.client_company_name}
                onChange={(e) => handleChange('client_company_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_contact_person">Contact Person</Label>
              <Input
                id="client_contact_person"
                value={formData.client_contact_person}
                onChange={(e) => handleChange('client_contact_person', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => handleChange('client_email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client_phone">Client Phone</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => handleChange('client_phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                value={formData.client_address}
                onChange={(e) => handleChange('client_address', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="submission_date">Submission Date</Label>
              <Input
                id="submission_date"
                type="date"
                value={formData.submission_date}
                onChange={(e) => handleChange('submission_date', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="company_contact_details">Company Contact Details</Label>
              <Textarea
                id="company_contact_details"
                value={formData.company_contact_details}
                onChange={(e) => handleChange('company_contact_details', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Executive Summary</h3>
          <div>
            <Label htmlFor="executive_summary">Executive Summary</Label>
            <Textarea
              id="executive_summary"
              value={formData.executive_summary}
              onChange={(e) => handleChange('executive_summary', e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="key_objectives">Key Objectives</Label>
            <Textarea
              id="key_objectives"
              value={formData.key_objectives}
              onChange={(e) => handleChange('key_objectives', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="why_choose_us">Why Choose Us</Label>
            <Textarea
              id="why_choose_us"
              value={formData.why_choose_us}
              onChange={(e) => handleChange('why_choose_us', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Problem Statement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Problem Statement</h3>
          <div>
            <Label htmlFor="problem_description">Problem Description</Label>
            <Textarea
              id="problem_description"
              value={formData.problem_description}
              onChange={(e) => handleChange('problem_description', e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="background_context">Background Context</Label>
            <Textarea
              id="background_context"
              value={formData.background_context}
              onChange={(e) => handleChange('background_context', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Approach/Solution */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Approach & Solution</h3>
          <div>
            <Label htmlFor="proposed_solution">Proposed Solution</Label>
            <Textarea
              id="proposed_solution"
              value={formData.proposed_solution}
              onChange={(e) => handleChange('proposed_solution', e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="strategy_method">Strategy & Method</Label>
            <Textarea
              id="strategy_method"
              value={formData.strategy_method}
              onChange={(e) => handleChange('strategy_method', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* About Us */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">About Us</h3>
          <div>
            <Label htmlFor="company_bio">Company Bio</Label>
            <Textarea
              id="company_bio"
              value={formData.company_bio}
              onChange={(e) => handleChange('company_bio', e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Terms & Conditions</h3>
          <div>
            <Label htmlFor="terms_conditions">Terms & Conditions</Label>
            <Textarea
              id="terms_conditions"
              value={formData.terms_conditions}
              onChange={(e) => handleChange('terms_conditions', e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="call_to_action">Call to Action</Label>
            <Input
              id="call_to_action"
              value={formData.call_to_action}
              onChange={(e) => handleChange('call_to_action', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Proposal'}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};
