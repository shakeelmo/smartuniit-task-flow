import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProposalDeliverablesFormProps {
  proposalId: string;
}

export const ProposalDeliverablesForm: React.FC<ProposalDeliverablesFormProps> = ({
  proposalId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDeliverable, setNewDeliverable] = useState({ title: '', description: '' });
  const [editingDeliverable, setEditingDeliverable] = useState({ title: '', description: '' });
  const queryClient = useQueryClient();

  const { data: deliverables, isLoading } = useQuery({
    queryKey: ['deliverables', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_deliverables')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  const createDeliverable = useMutation({
    mutationFn: async (deliverable: { title: string; description: string }) => {
      const { error } = await supabase
        .from('proposal_deliverables')
        .insert([{
          ...deliverable,
          proposal_id: proposalId,
          sort_order: (deliverables?.length || 0) + 1
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', proposalId] });
      setNewDeliverable({ title: '', description: '' });
      toast({ title: "Success", description: "Deliverable added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add deliverable", variant: "destructive" });
    },
  });

  const updateDeliverable = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; description: string } }) => {
      const { error } = await supabase
        .from('proposal_deliverables')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', proposalId] });
      setEditingId(null);
      toast({ title: "Success", description: "Deliverable updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update deliverable", variant: "destructive" });
    },
  });

  const deleteDeliverable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposal_deliverables')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', proposalId] });
      toast({ title: "Success", description: "Deliverable deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete deliverable", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (newDeliverable.title.trim()) {
      createDeliverable.mutate(newDeliverable);
    }
  };

  const handleEdit = (deliverable: any) => {
    setEditingId(deliverable.id);
    setEditingDeliverable({ title: deliverable.title, description: deliverable.description || '' });
  };

  const handleSave = () => {
    if (editingId && editingDeliverable.title.trim()) {
      updateDeliverable.mutate({ id: editingId, data: editingDeliverable });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingDeliverable({ title: '', description: '' });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading deliverables...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Deliverables</h3>
        
        {/* Add new deliverable */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Add New Deliverable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-title">Title *</Label>
              <Input
                id="new-title"
                value={newDeliverable.title}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter deliverable title"
              />
            </div>
            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newDeliverable.description}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter deliverable description"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleAdd} 
              className="flex items-center gap-2"
              disabled={!newDeliverable.title.trim() || createDeliverable.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Deliverable
            </Button>
          </CardContent>
        </Card>

        {/* Existing deliverables */}
        <div className="space-y-4">
          {deliverables && deliverables.length > 0 ? (
            deliverables.map((deliverable) => (
              <Card key={deliverable.id}>
                <CardContent className="p-4">
                  {editingId === deliverable.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`edit-title-${deliverable.id}`}>Title *</Label>
                        <Input
                          id={`edit-title-${deliverable.id}`}
                          value={editingDeliverable.title}
                          onChange={(e) => setEditingDeliverable(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-description-${deliverable.id}`}>Description</Label>
                        <Textarea
                          id={`edit-description-${deliverable.id}`}
                          value={editingDeliverable.description}
                          onChange={(e) => setEditingDeliverable(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          disabled={!editingDeliverable.title.trim() || updateDeliverable.isPending}
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
                        <h4 className="font-medium">{deliverable.title}</h4>
                        {deliverable.description && (
                          <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(deliverable)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteDeliverable.mutate(deliverable.id)}
                          disabled={deleteDeliverable.isPending}
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
                No deliverables added yet. Add your first deliverable above.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
