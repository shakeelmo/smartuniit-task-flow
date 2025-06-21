
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FormattedContent } from '@/components/ui/formatted-content';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProposalBasicFormProps {
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const EnhancedProposalBasicForm: React.FC<ProposalBasicFormProps> = ({
  proposal,
  onUpdate,
  loading: externalLoading
}) => {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    executive: true,
    objectives: false,
    approach: false,
    strategy: false,
    terms: false
  });

  const [formData, setFormData] = useState({
    title: '',
    client_company_name: '',
    client_contact_person: '',
    client_email: '',
    client_phone: '',
    status: 'draft',
    executive_summary: '',
    project_objectives: '',
    proposed_approach: '',
    strategy_details: '',
    terms_conditions: ''
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title || '',
        client_company_name: proposal.client_company_name || '',
        client_contact_person: proposal.client_contact_person || '',
        client_email: proposal.client_email || '',
        client_phone: proposal.client_phone || '',
        status: proposal.status || 'draft',
        executive_summary: proposal.executive_summary || '',
        project_objectives: proposal.project_objectives || '',
        proposed_approach: proposal.proposed_approach || '',
        strategy_details: proposal.strategy_details || '',
        terms_conditions: proposal.terms_conditions || ''
      });
      setHasUnsavedChanges(false);
    }
  }, [proposal]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(formData);
      } else {
        const { error } = await supabase
          .from('proposals')
          .update(formData)
          .eq('id', proposal?.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Proposal basic information saved successfully",
        });
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        title: "Error",
        description: "Failed to save proposal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <Collapsible
        open={expandedSections.basic}
        onOpenChange={() => toggleSection('basic')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(formData.status)}>
                    {formData.status}
                  </Badge>
                  {expandedSections.basic ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter proposal title"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_company_name">Client Company *</Label>
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
                    placeholder="Primary contact person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    placeholder="client@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone">Client Phone</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Executive Summary Section */}
      <Collapsible
        open={expandedSections.executive}
        onOpenChange={() => toggleSection('executive')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Executive Summary</CardTitle>
                {expandedSections.executive ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <RichTextEditor
                  value={formData.executive_summary}
                  onChange={(value) => handleInputChange('executive_summary', value)}
                  placeholder="• Provide a high-level overview of the proposal
• Highlight key benefits and value proposition
• Summarize main objectives and approach"
                  rows={6}
                />
                {formData.executive_summary && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <FormattedContent content={formData.executive_summary} />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Project Objectives Section */}
      <Collapsible
        open={expandedSections.objectives}
        onOpenChange={() => toggleSection('objectives')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Project Objectives</CardTitle>
                {expandedSections.objectives ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <RichTextEditor
                  value={formData.project_objectives}
                  onChange={(value) => handleInputChange('project_objectives', value)}
                  placeholder="• Define clear project goals and outcomes
• Specify measurable success criteria
• Outline expected deliverables"
                  rows={5}
                />
                {formData.project_objectives && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <FormattedContent content={formData.project_objectives} />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Proposed Approach Section */}
      <Collapsible
        open={expandedSections.approach}
        onOpenChange={() => toggleSection('approach')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Proposed Approach</CardTitle>
                {expandedSections.approach ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <RichTextEditor
                  value={formData.proposed_approach}
                  onChange={(value) => handleInputChange('proposed_approach', value)}
                  placeholder="• Describe methodology and approach
• Outline key phases or milestones
• Explain implementation strategy"
                  rows={5}
                />
                {formData.proposed_approach && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <FormattedContent content={formData.proposed_approach} />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Strategy Details Section */}
      <Collapsible
        open={expandedSections.strategy}
        onOpenChange={() => toggleSection('strategy')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Strategy & Implementation</CardTitle>
                {expandedSections.strategy ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <RichTextEditor
                  value={formData.strategy_details}
                  onChange={(value) => handleInputChange('strategy_details', value)}
                  placeholder="• Detail strategic considerations
• Explain technical implementation
• Address potential challenges and solutions"
                  rows={5}
                />
                {formData.strategy_details && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <FormattedContent content={formData.strategy_details} />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Terms & Conditions Section */}
      <Collapsible
        open={expandedSections.terms}
        onOpenChange={() => toggleSection('terms')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Terms & Conditions</CardTitle>
                {expandedSections.terms ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <RichTextEditor
                  value={formData.terms_conditions}
                  onChange={(value) => handleInputChange('terms_conditions', value)}
                  placeholder="• Payment terms and conditions
• Project scope and limitations
• Intellectual property considerations
• Warranty and support terms"
                  rows={6}
                />
                {formData.terms_conditions && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <FormattedContent content={formData.terms_conditions} />
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading || externalLoading || !hasUnsavedChanges}
          className="min-w-[150px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </Button>
      </div>
    </div>
  );
};
