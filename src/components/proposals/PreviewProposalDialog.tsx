import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, Calculator } from 'lucide-react';
import { generateProposalPDF } from '@/utils/proposalPdfExport';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

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
      // Include customer logo URL in the proposal data
      const proposalWithLogo = {
        ...proposal,
        customer_logo_url: proposal.customer_logo_url
      };
      
      // Use the enhanced PDF generation with customer logo support
      await generateProposalPDF(proposalWithLogo);
      toast({
        title: "Success",
        description: "Professional proposal PDF with branding downloaded successfully",
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

  const quotationData = proposal.quotation_data;

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
            {/* Customer Logo Preview */}
            {proposal.customer_logo_url && (
              <div className="text-center border-b pb-4">
                <img 
                  src={proposal.customer_logo_url} 
                  alt="Customer Logo" 
                  className="h-16 mx-auto object-contain"
                />
              </div>
            )}

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

            {/* Quotation Section */}
            {quotationData && quotationData.items && quotationData.items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Quotation
                </h2>
                
                {/* Quotation Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  {quotationData.quotationNumber && (
                    <div>
                      <span className="font-semibold">Quotation Number:</span>
                      <p className="text-gray-700">{quotationData.quotationNumber}</p>
                    </div>
                  )}
                  {quotationData.validUntil && (
                    <div>
                      <span className="font-semibold">Valid Until:</span>
                      <p className="text-gray-700">{new Date(quotationData.validUntil).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Currency:</span>
                    <p className="text-gray-700">{quotationData.currency}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationData.items.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {quotationData.currency} {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                            {quotationData.currency} {item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">{quotationData.currency} {quotationData.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {quotationData.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">-{quotationData.currency} {quotationData.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {quotationData.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span className="font-medium">{quotationData.currency} {quotationData.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Grand Total:</span>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {quotationData.currency} {quotationData.grandTotal?.toFixed(2) || '0.00'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quotation Notes */}
                {quotationData.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Notes:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{quotationData.notes}</p>
                  </div>
                )}

                {/* Payment Terms */}
                {quotationData.terms && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Payment Terms:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{quotationData.terms}</p>
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
