
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
    console.log('EditProposalDialog received proposal:', proposal);
    setProposalData(proposal);
  }, [proposal]);

  const handleUpdateProposal = async (data: any) => {
    setLoading(true);
    try {
      console.log('Updating proposal with data:', data);
      
      const { error } = await supabase
        .from('proposals')
        .update(data)
        .eq('id', proposal.id);

      if (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }

      // Update local state with new data
      const updatedProposal = { ...proposalData, ...data };
      setProposalData(updatedProposal);
      
      console.log('Proposal updated successfully:', updatedProposal);
      
      toast({
        title: "Success",
        description: "Proposal updated successfully",
      });

      // Refresh parent component
      onSuccess();
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: `Failed to update proposal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Proposal: {proposal?.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="quotation">Quotation</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="basic" className="h-full overflow-y-auto mt-4">
                <ProposalBasicForm
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="deliverables" className="h-full overflow-y-auto mt-4">
                <ProposalDeliverablesForm proposalId={proposal?.id} />
              </TabsContent>
              
              <TabsContent value="timeline" className="h-full overflow-y-auto mt-4">
                <ProposalTimelineForm proposalId={proposal?.id} />
              </TabsContent>
              
              <TabsContent value="budget" className="h-full overflow-y-auto mt-4">
                <ProposalBudgetForm proposalId={proposal?.id} />
              </TabsContent>
              
              <TabsContent value="quotation" className="h-full mt-4">
                <ProposalQuotationForm 
                  proposalId={proposal?.id} 
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="case-studies" className="h-full overflow-y-auto mt-4">
                <ProposalCaseStudiesForm proposalId={proposal?.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 bg-white">
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
