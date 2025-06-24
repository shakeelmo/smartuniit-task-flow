
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Reviewer {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ProposalDocumentControlFormProps {
  proposalId: string;
  proposal?: any;
  onUpdate?: (data: any) => void;
  loading?: boolean;
}

export const ProposalDocumentControlForm: React.FC<ProposalDocumentControlFormProps> = ({
  proposalId,
  proposal,
  onUpdate,
  loading: externalLoading
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    version_number: '1.0',
    document_reviewers: [] as Reviewer[],
    confidentiality_included: true,
    understanding_requirements: '',
    customer_prerequisites: '',
    is_bilingual: false,
    template_customization: {}
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        version_number: proposal.version_number || '1.0',
        document_reviewers: proposal.document_reviewers || [],
        confidentiality_included: proposal.confidentiality_included ?? true,
        understanding_requirements: proposal.understanding_requirements || '',
        customer_prerequisites: proposal.customer_prerequisites || '',
        is_bilingual: proposal.is_bilingual || false,
        template_customization: proposal.template_customization || {}
      });
    }
  }, [proposal]);

  const addReviewer = () => {
    const newReviewer: Reviewer = {
      id: `reviewer_${Date.now()}`,
      name: '',
      role: '',
      department: ''
    };
    setFormData(prev => ({
      ...prev,
      document_reviewers: [...prev.document_reviewers, newReviewer]
    }));
  };

  const updateReviewer = (id: string, field: keyof Reviewer, value: string) => {
    setFormData(prev => ({
      ...prev,
      document_reviewers: prev.document_reviewers.map(reviewer =>
        reviewer.id === id ? { ...reviewer, [field]: value } : reviewer
      )
    }));
  };

  const removeReviewer = (id: string) => {
    setFormData(prev => ({
      ...prev,
      document_reviewers: prev.document_reviewers.filter(reviewer => reviewer.id !== id)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        version_number: formData.version_number,
        document_reviewers: formData.document_reviewers as any, // Cast to any to match Json type
        confidentiality_included: formData.confidentiality_included,
        understanding_requirements: formData.understanding_requirements,
        customer_prerequisites: formData.customer_prerequisites,
        is_bilingual: formData.is_bilingual,
        template_customization: formData.template_customization as any // Cast to any to match Json type
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
        description: "Document control settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving document control:', error);
      toast({
        title: "Error",
        description: "Failed to save document control settings",
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
            <FileText className="h-6 w-6" />
            Document Control
          </h2>
          <p className="text-gray-600">Manage document versioning, reviewers, and settings</p>
        </div>
      </div>

      {/* Version & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version_number">Version Number</Label>
              <Input
                id="version_number"
                value={formData.version_number}
                onChange={(e) => setFormData({...formData, version_number: e.target.value})}
                placeholder="1.0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="confidentiality"
                checked={formData.confidentiality_included}
                onCheckedChange={(checked) => setFormData({...formData, confidentiality_included: checked})}
              />
              <Label htmlFor="confidentiality">Include Confidentiality Agreement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bilingual"
                checked={formData.is_bilingual}
                onCheckedChange={(checked) => setFormData({...formData, is_bilingual: checked})}
              />
              <Label htmlFor="bilingual">Enable Bilingual Output (Arabic/English)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Reviewers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Reviewers</CardTitle>
            <Button onClick={addReviewer} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reviewer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.document_reviewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              No reviewers added yet. Click "Add Reviewer" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.document_reviewers.map((reviewer) => (
                <div key={reviewer.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={reviewer.name}
                      onChange={(e) => updateReviewer(reviewer.id, 'name', e.target.value)}
                      placeholder="Reviewer name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input
                      value={reviewer.role}
                      onChange={(e) => updateReviewer(reviewer.id, 'role', e.target.value)}
                      placeholder="Role/Position"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Department</Label>
                    <Input
                      value={reviewer.department}
                      onChange={(e) => updateReviewer(reviewer.id, 'department', e.target.value)}
                      placeholder="Department"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeReviewer(reviewer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Understanding Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Client Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="understanding_requirements">
                Understanding of Requirements
              </Label>
              <Textarea
                id="understanding_requirements"
                value={formData.understanding_requirements}
                onChange={(e) => setFormData({...formData, understanding_requirements: e.target.value})}
                placeholder="Describe your understanding of the client's requirements and needs..."
                rows={6}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="customer_prerequisites">
                Customer Prerequisites & Assumptions
              </Label>
              <Textarea
                id="customer_prerequisites"
                value={formData.customer_prerequisites}
                onChange={(e) => setFormData({...formData, customer_prerequisites: e.target.value})}
                placeholder="List any prerequisites, assumptions, or dependencies from the customer side..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading || externalLoading}
        >
          {loading ? 'Saving...' : 'Save Document Control'}
        </Button>
      </div>
    </div>
  );
};
