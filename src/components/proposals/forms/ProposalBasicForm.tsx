
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomerLogoUpload } from '../CustomerLogoUpload';

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
});

interface ProposalBasicFormProps {
  proposal: any;
  onUpdate: (data: any) => void;
  loading: boolean;
}

export const ProposalBasicForm: React.FC<ProposalBasicFormProps> = ({
  proposal,
  onUpdate,
  loading
}) => {
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
    }
  });

  // Update form when proposal changes
  useEffect(() => {
    if (proposal) {
      console.log('ProposalBasicForm: Updating form with proposal data:', proposal);
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
      });
    }
  }, [proposal, form]);

  const onSubmit = (data: z.infer<typeof proposalBasicSchema>) => {
    console.log('ProposalBasicForm: Submitting form data:', data);
    onUpdate(data);
  };

  const handleLogoChange = (logoUrl: string | null) => {
    console.log('ProposalBasicForm: Logo changed to:', logoUrl);
    form.setValue('customer_logo_url', logoUrl || '');
    
    // Auto-save the logo change immediately
    const currentFormData = form.getValues();
    const updatedData = {
      ...currentFormData,
      customer_logo_url: logoUrl || ''
    };
    console.log('ProposalBasicForm: Auto-saving logo change:', updatedData);
    onUpdate(updatedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Logo Upload Section */}
        <CustomerLogoUpload
          currentLogoUrl={form.watch('customer_logo_url')}
          onLogoChange={handleLogoChange}
        />

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
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
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Client Address */}
        <FormField
          control={form.control}
          name="client_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Address</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter client address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input
                    {...field}
                    type="date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Executive Summary */}
        <FormField
          control={form.control}
          name="executive_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Executive Summary</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter executive summary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Key Objectives */}
        <FormField
          control={form.control}
          name="key_objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Objectives</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter key objectives" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Why Choose Us */}
        <FormField
          control={form.control}
          name="why_choose_us"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why Choose Us</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter why choose us" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Problem Description */}
        <FormField
          control={form.control}
          name="problem_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter problem description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Background Context */}
        <FormField
          control={form.control}
          name="background_context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Context</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter background context" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Proposed Solution */}
        <FormField
          control={form.control}
          name="proposed_solution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Solution</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter proposed solution" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Strategy & Method */}
        <FormField
          control={form.control}
          name="strategy_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strategy & Method</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter strategy & method" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Bio */}
        <FormField
          control={form.control}
          name="company_bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Bio</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter company bio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms & Conditions */}
        <FormField
          control={form.control}
          name="terms_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter terms & conditions" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Call to Action */}
        <FormField
          control={form.control}
          name="call_to_action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call to Action</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter call to action" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Proposal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
