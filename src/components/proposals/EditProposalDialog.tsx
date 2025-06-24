
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedProposalBasicForm } from './forms/EnhancedProposalBasicForm';
import { ProposalDeliverablesForm } from './forms/ProposalDeliverablesForm';
import { ProposalTimelineForm } from './forms/ProposalTimelineForm';
import { ProposalBudgetForm } from './forms/ProposalBudgetForm';
import { ProposalCaseStudiesForm } from './forms/ProposalCaseStudiesForm';
import { ProposalQuotationForm } from './forms/ProposalQuotationForm';
import { ProposalDocumentControlForm } from './forms/ProposalDocumentControlForm';
import { ProposalCommercialForm } from './forms/ProposalCommercialForm';
import { ProposalSignatureForm } from './forms/ProposalSignatureForm';
import { UnsavedChangesDialog } from './forms/UnsavedChangesDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Save, X, AlertTriangle } from 'lucide-react';

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  useEffect(() => {
    console.log('EditProposalDialog received proposal:', proposal);
    setProposalData(proposal);
    setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(false);
      
      console.log('Proposal updated successfully:', updatedProposal);
      
      toast({
        title: "Success",
        description: "Proposal updated successfully",
      });

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

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSaveAndClose = async () => {
    if (hasUnsavedChanges) {
      // Save any pending changes first
      try {
        setLoading(true);
        await handleUpdateProposal(proposalData);
      } catch (error) {
        console.error('Error saving before close:', error);
        return; // Don't close if save failed
      } finally {
        setLoading(false);
      }
    }
    
    // Refresh parent component to reflect all changes made during editing session
    onSuccess();
    onOpenChange(false);
  };

  const handleUnsavedConfirm = () => {
    setShowUnsavedDialog(false);
    setHasUnsavedChanges(false);
    if (pendingClose) {
      setPendingClose(false);
      onOpenChange(false);
    }
  };

  const handleUnsavedCancel = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  Edit Proposal: {proposal?.title}
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Make changes to your proposal. Changes are saved automatically to individual sections.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
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
              
              <div className="flex-1 min-h-0 px-6">
                <TabsContent value="basic" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <EnhancedProposalBasicForm
                      proposal={proposalData}
                      onUpdate={(data) => {
                        handleUpdateProposal(data);
                        markAsChanged();
                      }}
                      loading={loading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="document-control" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalDocumentControlForm
                      proposalId={proposal?.id}
                      proposal={proposalData}
                      onUpdate={(data) => {
                        handleUpdateProposal(data);
                        markAsChanged();
                      }}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="deliverables" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalDeliverablesForm proposalId={proposal?.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalTimelineForm proposalId={proposal?.id} />
                  </div>
                </TabsContent>

                <TabsContent value="commercial" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalCommercialForm
                      proposalId={proposal?.id}
                      proposal={proposalData}
                      onUpdate={(data) => {
                        handleUpdateProposal(data);
                        markAsChanged();
                      }}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="budget" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalBudgetForm proposalId={proposal?.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="quotation" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalQuotationForm 
                      proposalId={proposal?.id} 
                      proposal={proposalData}
                      onUpdate={(data) => {
                        handleUpdateProposal(data);
                        markAsChanged();
                      }}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="case-studies" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalCaseStudiesForm proposalId={proposal?.id} />
                  </div>
                </TabsContent>

                <TabsContent value="signatures" className="h-full overflow-y-auto mt-4 pr-2 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="min-h-0 flex-1">
                    <ProposalSignatureForm
                      proposalId={proposal?.id}
                      proposal={proposalData}
                      onUpdate={(data) => {
                        handleUpdateProposal(data);
                        markAsChanged();
                      }}
                      loading={loading}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="flex justify-between items-center gap-4 p-4 border-t flex-shrink-0 bg-white">
            <div className="text-sm text-gray-500">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                {hasUnsavedChanges ? 'Cancel' : 'Close'}
              </Button>
              <Button 
                onClick={handleSaveAndClose} 
                disabled={loading}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save & Close'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
      />
    </>
  );
};
