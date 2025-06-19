
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText } from 'lucide-react';
import { generateProposalPDF } from '@/utils/proposalPdfExport';
import { toast } from '@/components/ui/use-toast';

interface PreviewProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: any;
  onClose: () => void;
}

export const PreviewProposalDialog: React.FC<PreviewProposalDialogProps> = ({
  open,
  onOpenChange,
  proposal,
  onClose
}) => {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    
    setGenerating(true);
    try {
      await generateProposalPDF(proposal);
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Preview Proposal: {proposal.title}</DialogTitle>
            <Button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {generating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-8 p-6 bg-white">
            {/* Cover Page */}
            <div className="text-center space-y-4 border-b pb-8">
              <h1 className="text-4xl font-bold text-primary">{proposal.title}</h1>
              {proposal.project_name && (
                <h2 className="text-2xl text-gray-700">{proposal.project_name}</h2>
              )}
              {proposal.client_company_name && (
                <p className="text-lg text-gray-600">Prepared for: {proposal.client_company_name}</p>
              )}
              {proposal.company_name && (
                <p className="text-lg text-gray-600">Prepared by: {proposal.company_name}</p>
              )}
              {proposal.submission_date && (
                <p className="text-gray-500">{new Date(proposal.submission_date).toLocaleDateString()}</p>
              )}
              {proposal.reference_number && (
                <p className="text-sm text-gray-500">Reference: {proposal.reference_number}</p>
              )}
            </div>

            {/* Executive Summary */}
            {proposal.executive_summary && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2">
                  Executive Summary
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{proposal.executive_summary}</p>
                </div>
                
                {proposal.key_objectives && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Objectives</h3>
                    <p className="text-gray-700">{proposal.key_objectives}</p>
                  </div>
                )}
                
                {proposal.why_choose_us && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Why Choose Us</h3>
                    <p className="text-gray-700">{proposal.why_choose_us}</p>
                  </div>
                )}
              </section>
            )}

            {/* Problem Statement */}
            {(proposal.problem_description || proposal.background_context) && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2">
                  Problem Statement
                </h2>
                {proposal.problem_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
                    <p className="text-gray-700">{proposal.problem_description}</p>
                  </div>
                )}
                {proposal.background_context && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Background Context</h3>
                    <p className="text-gray-700">{proposal.background_context}</p>
                  </div>
                )}
              </section>
            )}

            {/* Approach & Solution */}
            {(proposal.proposed_solution || proposal.strategy_method) && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2">
                  Approach & Solution
                </h2>
                {proposal.proposed_solution && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Proposed Solution</h3>
                    <p className="text-gray-700">{proposal.proposed_solution}</p>
                  </div>
                )}
                {proposal.strategy_method && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Strategy & Method</h3>
                    <p className="text-gray-700">{proposal.strategy_method}</p>
                  </div>
                )}
              </section>
            )}

            {/* About Us */}
            {proposal.company_bio && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2">
                  About Us
                </h2>
                <p className="text-gray-700">{proposal.company_bio}</p>
              </section>
            )}

            {/* Terms & Conditions */}
            {proposal.terms_conditions && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2">
                  Terms & Conditions
                </h2>
                <p className="text-gray-700">{proposal.terms_conditions}</p>
              </section>
            )}

            {/* Call to Action */}
            {proposal.call_to_action && (
              <section className="text-center bg-primary text-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Ready to Get Started?</h2>
                <p className="text-lg">{proposal.call_to_action}</p>
                {proposal.company_contact_details && (
                  <div className="mt-4 text-sm opacity-90">
                    {proposal.company_contact_details}
                  </div>
                )}
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
