
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProposalSignatureFormProps {
  proposalId: string;
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const ProposalSignatureForm: React.FC<ProposalSignatureFormProps> = ({
  proposalId,
  proposal,
  onUpdate,
  loading: externalLoading
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_signature_data: '',
    company_signature_data: '',
    signature_date: ''
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        client_signature_data: proposal.client_signature_data || '',
        company_signature_data: proposal.company_signature_data || '',
        signature_date: proposal.signature_date || ''
      });
    }
  }, [proposal]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        client_signature_data: formData.client_signature_data,
        company_signature_data: formData.company_signature_data,
        signature_date: formData.signature_date || null
      };

      if (onUpdate) {
        await onUpdate(updateData);
      } else {
        const { error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Signature information saved successfully",
      });
    } catch (error) {
      console.error('Error saving signatures:', error);
      toast({
        title: "Error",
        description: "Failed to save signature information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            SOW Acceptance & Signatures
          </h2>
          <p className="text-gray-600">Statement of Work acceptance and signature collection</p>
        </div>
      </div>

      {/* SOW Acceptance Text */}
      <Card>
        <CardHeader>
          <CardTitle>Statement of Work Acceptance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-sm">
            <p className="mb-4">
              By signing below, both parties acknowledge and agree to the terms, conditions, scope of work, 
              timeline, and commercial terms outlined in this proposal. This acceptance constitutes a binding 
              agreement to proceed with the project as described.
            </p>
            <p className="text-gray-600">
              يوقع الطرفان أدناه على موافقتهما على الشروط والأحكام ونطاق العمل والجدول الزمني والشروط التجارية 
              المحددة في هذا الاقتراح. تشكل هذه الموافقة اتفاقية ملزمة للمضي قدماً في المشروع كما هو موضح.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signature Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Signature Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="signature_date">Date of Agreement</Label>
            <Input
              id="signature_date"
              type="date"
              value={formData.signature_date}
              onChange={(e) => setFormData({...formData, signature_date: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Acceptance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_signature">Client Signature</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[120px] flex items-center justify-center">
                  <div className="text-gray-500">
                    <PenTool className="h-8 w-8 mx-auto mb-2" />
                    <p>Digital signature placeholder</p>
                    <p className="text-xs">To be signed by client</p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="client_signature_data">Client Representative Details</Label>
                <Textarea
                  id="client_signature_data"
                  value={formData.client_signature_data}
                  onChange={(e) => setFormData({...formData, client_signature_data: e.target.value})}
                  placeholder="Name, Title, Company, Date"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Acceptance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_signature">Company Signature</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[120px] flex items-center justify-center">
                  <div className="text-gray-500">
                    <PenTool className="h-8 w-8 mx-auto mb-2" />
                    <p>Digital signature placeholder</p>
                    <p className="text-xs">To be signed by company</p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="company_signature_data">Company Representative Details</Label>
                <Textarea
                  id="company_signature_data"
                  value={formData.company_signature_data}
                  onChange={(e) => setFormData({...formData, company_signature_data: e.target.value})}
                  placeholder="Name, Title, Company, Date"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading || externalLoading}
        >
          {loading ? 'Saving...' : 'Save Signature Information'}
        </Button>
      </div>
    </div>
  );
};
