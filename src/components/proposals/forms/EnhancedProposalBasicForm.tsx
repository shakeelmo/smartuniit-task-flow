
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLogoUpload } from '../CustomerLogoUpload';
import { VisualReferencesSection } from './VisualReferencesSection';
import { DocumentVersionTracker } from './DocumentVersionTracker';
import { TableOfContents } from './TableOfContents';
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator';
import { toast } from '@/components/ui/use-toast';
import { Save, CheckCircle } from 'lucide-react';

const proposalBasicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  project_name: z.string().optional(),
  client_company_name: z.string().optional(),
  client_contact_person: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  company_name: z.string().optional(),
  company_contact_details: z.string().optional(),
  reference_number: z.string().optional(),
  submission_date: z.string().optional(),
  executive_summary: z.string().optional(),
  key_objectives: z.string().optional(),
  why_choose_us: z.string().optional(),
  problem_description: z.string().optional(),
  background_context: z.string().optional(),
  proposed_solution: z.string().optional(),
  strategy_method: z.string().optional(),
  company_bio: z.string().optional(),
  terms_conditions: z.string().optional(),
  call_to_action: z.string().optional(),
  customer_logo_url: z.string().optional(),
  visual_references: z.array(z.any()).optional(),
  duration_of_project: z.string().optional(),
});

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
}

interface VisualReference {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageFile?: File;
}

interface TOCSection {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}

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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic-info');
  const [visualReferences, setVisualReferences] = useState<VisualReference[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>([
    {
      version: '1.0',
      date: new Date().toLocaleDateString(),
      author: 'Current User',
      changes: 'Initial proposal creation'
    }
  ]);

  const form = useForm<z.infer<typeof proposalBasicSchema>>({
    resolver: zodResolver(proposalBasicSchema),
    defaultValues: {
      title: proposal?.title || '',
      project_name: proposal?.project_name || '',
      client_company_name: proposal?.client_company_name || '',
      client_contact_person: proposal?.client_contact_person || '',
      client_email: proposal?.client_email || '',
      client_phone: proposal?.client_phone || '',
      client_address: proposal?.client_address || '',
      company_name: proposal?.company_name || '',
      company_contact_details: proposal?.company_contact_details || '',
      reference_number: proposal?.reference_number || '',
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
      call_to_action: proposal?.call_to_action || '',
      customer_logo_url: proposal?.customer_logo_url || '',
      duration_of_project: proposal?.duration_of_project || '',
    }
  });

  // Table of Contents sections
  const tocSections: TOCSection[] = [
    { id: 'basic-info', title: 'Basic Information' },
    { id: 'client-details', title: 'Client Details' },
    { id: 'company-info', title: 'Company Information' },
    { id: 'executive-summary', title: 'Executive Summary' },
    { id: 'problem-solution', title: 'Problem & Solution' },
    { id: 'strategy', title: 'Strategy & Method' },
    { id: 'duration', title: 'Project Duration' },
    { id: 'visual-references', title: 'Visual References' },
    { id: 'company-bio', title: 'Company Bio' },
    { id: 'terms', title: 'Terms & Conditions' }
  ];

  // Auto-save functionality
  const autoSave = useCallback(async (data: any, sectionName?: string) => {
    if (isAutoSaving) return;
    
    setIsAutoSaving(true);
    try {
      const updateData = {
        ...data,
        visual_references: visualReferences,
        updated_at: new Date().toISOString()
      };
      
      await onUpdate(updateData);
      setLastSaved(new Date());
      
      if (sectionName) {
        toast({
          title: "Section Saved",
          description: `${sectionName} has been saved successfully`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save Failed",
        description: "Changes will be saved when you manually save",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, [onUpdate, visualReferences, isAutoSaving]);

  // Section-specific save handlers
  const saveSection = async (sectionName: string) => {
    const currentData = form.getValues();
    await autoSave(currentData, sectionName);
  };

  // Update form when proposal changes
  useEffect(() => {
    if (proposal) {
      form.reset({
        title: proposal.title || '',
        project_name: proposal.project_name || '',
        client_company_name: proposal.client_company_name || '',
        client_contact_person: proposal.client_contact_person || '',
        client_email: proposal.client_email || '',
        client_phone: proposal.client_phone || '',
        client_address: proposal.client_address || '',
        company_name: proposal.company_name || '',
        company_contact_details: proposal.company_contact_details || '',
        reference_number: proposal.reference_number || '',
        submission_date: proposal.submission_date || '',
        executive_summary: proposal.executive_summary || '',
        key_objectives: proposal.key_objectives || '',
        why_choose_us: proposal.why_choose_us || '',
        problem_description: proposal.problem_description || '',
        background_context: proposal.background_context || '',
        proposed_solution: proposal.proposed_solution || '',
        strategy_method: proposal.strategy_method || '',
        company_bio: proposal.company_bio || '',
        terms_conditions: proposal.terms_conditions || '',
        call_to_action: proposal.call_to_action || '',
        customer_logo_url: proposal.customer_logo_url || '',
        duration_of_project: proposal.duration_of_project || '',
      });

      if (proposal.visual_references) {
        setVisualReferences(proposal.visual_references);
      }
    }
  }, [proposal, form]);

  const onSubmit = async (data: z.infer<typeof proposalBasicSchema>) => {
    const updateData = {
      ...data,
      visual_references: visualReferences,
    };
    await onUpdate(updateData);
  };

  const handleLogoChange = async (logoUrl: string | null) => {
    form.setValue('customer_logo_url', logoUrl || '');
    const currentData = form.getValues();
    await autoSave({ ...currentData, customer_logo_url: logoUrl || '' });
  };

  const handleVersionUpdate = (newVersion: string, changes: string) => {
    const newEntry: VersionEntry = {
      version: newVersion,
      date: new Date().toLocaleDateString(),
      author: 'Current User',
      changes
    };
    setVersionHistory([newEntry, ...versionHistory]);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Smart Universe Background Logo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-100 opacity-5 select-none"
          style={{
            fontSize: '20rem',
            fontWeight: 'bold',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            whiteSpace: 'nowrap'
          }}
        >
          SMART UNIVERSE
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents - Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TableOfContents
              sections={tocSections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
            
            <div className="mt-4">
              <AutoSaveIndicator 
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Document Version Tracker */}
              <DocumentVersionTracker
                currentVersion={proposal?.version_number || '1.0'}
                lastUpdated={proposal?.updated_at || new Date().toISOString()}
                versionHistory={versionHistory}
                onVersionUpdate={handleVersionUpdate}
              />

              {/* Customer Logo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Branding</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerLogoUpload
                    currentLogoUrl={form.watch('customer_logo_url')}
                    onLogoChange={handleLogoChange}
                  />
                </CardContent>
              </Card>

              {/* Basic Information Section */}
              <Card id="basic-info">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Basic Information</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Basic Information')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Proposal Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter proposal title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter project name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter reference number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submission_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Client Details Section */}
              <Card id="client-details">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Client Details</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Client Details')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter client company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter client contact person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter client email" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter client phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Client Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter client address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Company Information Section */}
              <Card id="company-info">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Company Information</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Company Information')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_contact_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Contact Details</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter company contact details" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Executive Summary Section */}
              <Card id="executive-summary">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Executive Summary</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Executive Summary')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="executive_summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Executive Summary</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter executive summary" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="key_objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Objectives</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter key objectives" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="why_choose_us"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why Choose Us</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter why choose us" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Problem & Solution Section */}
              <Card id="problem-solution">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Problem & Solution</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Problem & Solution')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="problem_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problem Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter problem description" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="background_context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Context</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter background context" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposed_solution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Solution</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter proposed solution" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Strategy & Method Section */}
              <Card id="strategy">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Strategy & Method</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Strategy & Method')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="strategy_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strategy & Method</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter strategy & method" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Project Duration Section */}
              <Card id="duration">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Duration of Project</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Project Duration')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="duration_of_project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Duration</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="e.g., This project of Excavation & laying of Fiber Optic Cable is expected to be completed within 25 days." 
                            rows={3} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Visual References Section */}
              <div id="visual-references">
                <VisualReferencesSection
                  references={visualReferences}
                  onReferencesChange={setVisualReferences}
                />
              </div>

              {/* Company Bio Section */}
              <Card id="company-bio">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Company Bio</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Company Bio')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="company_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter company bio" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Terms & Conditions Section */}
              <Card id="terms">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Terms & Conditions</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveSection('Terms & Conditions')}
                    disabled={isAutoSaving}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="terms_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter terms & conditions" rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="call_to_action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call to Action</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter call to action" rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Final Save Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading || isAutoSaving} className="min-w-[150px]">
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
