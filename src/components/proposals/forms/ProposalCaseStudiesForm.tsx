import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProposalCaseStudiesFormProps {
  proposalId: string;
}

export const ProposalCaseStudiesForm: React.FC<ProposalCaseStudiesFormProps> = ({
  proposalId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCaseStudy, setNewCaseStudy] = useState({ 
    title: '', 
    description: '', 
    client_name: '',
    testimonial: ''
  });
  const [editingCaseStudy, setEditingCaseStudy] = useState({ 
    title: '', 
    description: '', 
    client_name: '',
    testimonial: ''
  });
  const queryClient = useQueryClient();

  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ['case-studies', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_case_studies')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  const createCaseStudy = useMutation({
    mutationFn: async (caseStudy: any) => {
      const { error } = await supabase
        .from('proposal_case_studies')
        .insert([{
          ...caseStudy,
          proposal_id: proposalId,
          sort_order: (caseStudies?.length || 0) + 1
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies', proposalId] });
      setNewCaseStudy({ title: '', description: '', client_name: '', testimonial: '' });
      toast({ title: "Success", description: "Case study added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add case study", variant: "destructive" });
    },
  });

  const updateCaseStudy = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('proposal_case_studies')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies', proposalId] });
      setEditingId(null);
      toast({ title: "Success", description: "Case study updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update case study", variant: "destructive" });
    },
  });

  const deleteCaseStudy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposal_case_studies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies', proposalId] });
      toast({ title: "Success", description: "Case study deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete case study", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (newCaseStudy.title.trim()) {
      createCaseStudy.mutate(newCaseStudy);
    }
  };

  const handleEdit = (caseStudy: any) => {
    setEditingId(caseStudy.id);
    setEditingCaseStudy({
      title: caseStudy.title,
      description: caseStudy.description || '',
      client_name: caseStudy.client_name || '',
      testimonial: caseStudy.testimonial || ''
    });
  };

  const handleSave = () => {
    if (editingId && editingCaseStudy.title.trim()) {
      updateCaseStudy.mutate({ id: editingId, data: editingCaseStudy });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingCaseStudy({ title: '', description: '', client_name: '', testimonial: '' });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading case studies...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Case Studies & Testimonials</h3>
        
        {/* Add new case study */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Add New Case Study
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-cs-title">Title *</Label>
              <Input
                id="new-cs-title"
                value={newCaseStudy.title}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter case study title"
              />
            </div>
            <div>
              <Label htmlFor="new-cs-client">Client Name</Label>
              <Input
                id="new-cs-client"
                value={newCaseStudy.client_name}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="new-cs-description">Description</Label>
              <Textarea
                id="new-cs-description"
                value={newCaseStudy.description}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project and results"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="new-cs-testimonial">Testimonial</Label>
              <Textarea
                id="new-cs-testimonial"
                value={newCaseStudy.testimonial}
                onChange={(e) => setNewCaseStudy(prev => ({ ...prev, testimonial: e.target.value }))}
                placeholder="Client testimonial or feedback"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleAdd} 
              className="flex items-center gap-2"
              disabled={!newCaseStudy.title.trim() || createCaseStudy.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Case Study
            </Button>
          </CardContent>
        </Card>

        {/* Existing case studies */}
        <div className="space-y-4">
          {caseStudies && caseStudies.length > 0 ? (
            caseStudies.map((caseStudy) => (
              <Card key={caseStudy.id}>
                <CardContent className="p-4">
                  {editingId === caseStudy.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`edit-cs-title-${caseStudy.id}`}>Title *</Label>
                        <Input
                          id={`edit-cs-title-${caseStudy.id}`}
                          value={editingCaseStudy.title}
                          onChange={(e) => setEditingCaseStudy(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-cs-client-${caseStudy.id}`}>Client Name</Label>
                        <Input
                          id={`edit-cs-client-${caseStudy.id}`}
                          value={editingCaseStudy.client_name}
                          onChange={(e) => setEditingCaseStudy(prev => ({ ...prev, client_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-cs-description-${caseStudy.id}`}>Description</Label>
                        <Textarea
                          id={`edit-cs-description-${caseStudy.id}`}
                          value={editingCaseStudy.description}
                          onChange={(e) => setEditingCaseStudy(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-cs-testimonial-${caseStudy.id}`}>Testimonial</Label>
                        <Textarea
                          id={`edit-cs-testimonial-${caseStudy.id}`}
                          value={editingCaseStudy.testimonial}
                          onChange={(e) => setEditingCaseStudy(prev => ({ ...prev, testimonial: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          disabled={!editingCaseStudy.title.trim() || updateCaseStudy.isPending}
                          className="flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          className="flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          {caseStudy.title}
                        </h4>
                        {caseStudy.client_name && (
                          <p className="text-sm text-primary mt-1 ml-6">Client: {caseStudy.client_name}</p>
                        )}
                        {caseStudy.description && (
                          <p className="text-sm text-gray-600 mt-2 ml-6">{caseStudy.description}</p>
                        )}
                        {caseStudy.testimonial && (
                          <blockquote className="text-sm italic text-gray-700 mt-2 ml-6 p-3 bg-gray-50 rounded border-l-4 border-primary">
                            "{caseStudy.testimonial}"
                          </blockquote>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(caseStudy)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCaseStudy.mutate(caseStudy.id)}
                          disabled={deleteCaseStudy.isPending}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                No case studies added yet. Add your first case study above to showcase your experience.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
