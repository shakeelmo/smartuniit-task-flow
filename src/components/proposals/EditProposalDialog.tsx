
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalBasicForm } from './forms/ProposalBasicForm';
import { ProposalDeliverablesForm } from './forms/ProposalDeliverablesForm';
import { ProposalTimelineForm } from './forms/ProposalTimelineForm';
import { ProposalBudgetForm } from './forms/ProposalBudgetForm';
import { ProposalCaseStudiesForm } from './forms/ProposalCaseStudiesForm';
import { ProposalQuotationForm } from './forms/ProposalQuotationForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface EditProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: any;
  onSuccess: () => void;
}

export const EditProposalDialog: React.FC<EditProposalDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [proposalData, setProposalData] = useState(proposal);

  useEffect(() => {
    setProposalData(proposal);
  }, [proposal]);

  const handleUpdateProposal = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update(data)
        .eq('id', proposal.id);

      if (error) throw error;

      setProposalData({ ...proposalData, ...data });
      
      toast({
        title: "Success",
        description: "Proposal updated successfully",
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Proposal: {proposal?.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="quotation">Quotation</TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <ProposalBasicForm
              proposal={proposalData}
              onUpdate={handleUpdateProposal}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="deliverables" className="mt-4">
            <ProposalDeliverablesForm proposalId={proposal?.id} />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-4">
            <ProposalTimelineForm proposalId={proposal?.id} />
          </TabsContent>
          
          <TabsContent value="budget" className="mt-4">
            <ProposalBudgetForm proposalId={proposal?.id} />
          </TabsContent>
          
          <TabsContent value="quotation" className="mt-4">
            <ProposalQuotationForm proposalId={proposal?.id} />
          </TabsContent>
          
          <TabsContent value="case-studies" className="mt-4">
            <ProposalCaseStudiesForm proposalId={proposal?.id} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAndClose}>
            Save & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
