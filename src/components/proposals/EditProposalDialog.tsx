
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalBasicForm } from './forms/ProposalBasicForm';
import { ProposalDeliverablesForm } from './forms/ProposalDeliverablesForm';
import { ProposalTimelineForm } from './forms/ProposalTimelineForm';
import { ProposalBudgetForm } from './forms/ProposalBudgetForm';
import { ProposalCaseStudiesForm } from './forms/ProposalCaseStudiesForm';
import { ProposalQuotationForm } from './forms/ProposalQuotationForm';
import { ProposalDocumentControlForm } from './forms/ProposalDocumentControlForm';
import { ProposalCommercialForm } from './forms/ProposalCommercialForm';
import { ProposalSignatureForm } from './forms/ProposalSignatureForm';
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
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle>Edit Proposal: {proposal?.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-9 flex-shrink-0 mx-6 mt-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="document-control">Document Control</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="commercial">Commercial</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="quotation">Quotation</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden px-6">
              <TabsContent value="basic" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalBasicForm
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="document-control" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalDocumentControlForm
                  proposalId={proposal?.id}
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="deliverables" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalDeliverablesForm proposalId={proposal?.id} />
              </TabsContent>
              
              <TabsContent value="timeline" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalTimelineForm proposalId={proposal?.id} />
              </TabsContent>

              <TabsContent value="commercial" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalCommercialForm
                  proposalId={proposal?.id}
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="budget" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalBudgetForm proposalId={proposal?.id} />
              </TabsContent>
              
              <TabsContent value="quotation" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="flex-1 min-h-0">
                  <ProposalQuotationForm 
                    proposalId={proposal?.id} 
                    proposal={proposalData}
                    onUpdate={handleUpdateProposal}
                    loading={loading}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="case-studies" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalCaseStudiesForm proposalId={proposal?.id} />
              </TabsContent>

              <TabsContent value="signatures" className="h-full overflow-y-auto mt-4 data-[state=active]:flex data-[state=active]:flex-col">
                <ProposalSignatureForm
                  proposalId={proposal?.id}
                  proposal={proposalData}
                  onUpdate={handleUpdateProposal}
                  loading={loading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0 bg-white">
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
