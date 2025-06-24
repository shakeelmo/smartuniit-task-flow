import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProposalTimelineFormProps {
  proposalId: string;
}

export const ProposalTimelineForm: React.FC<ProposalTimelineFormProps> = ({
  proposalId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPhase, setNewPhase] = useState({ 
    phase_name: '', 
    description: '', 
    start_date: '', 
    completion_date: '' 
  });
  const [editingPhase, setEditingPhase] = useState({ 
    phase_name: '', 
    description: '', 
    start_date: '', 
    completion_date: '' 
  });
  const queryClient = useQueryClient();

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['timeline', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_timeline')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  const createPhase = useMutation({
    mutationFn: async (phase: any) => {
      const { error } = await supabase
        .from('proposal_timeline')
        .insert([{
          ...phase,
          proposal_id: proposalId,
          sort_order: (timeline?.length || 0) + 1,
          start_date: phase.start_date || null,
          completion_date: phase.completion_date || null
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', proposalId] });
      setNewPhase({ phase_name: '', description: '', start_date: '', completion_date: '' });
      toast({ title: "Success", description: "Timeline phase added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add timeline phase", variant: "destructive" });
    },
  });

  const updatePhase = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('proposal_timeline')
        .update({
          ...data,
          start_date: data.start_date || null,
          completion_date: data.completion_date || null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', proposalId] });
      setEditingId(null);
      toast({ title: "Success", description: "Timeline phase updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update timeline phase", variant: "destructive" });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposal_timeline')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', proposalId] });
      toast({ title: "Success", description: "Timeline phase deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete timeline phase", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (newPhase.phase_name.trim()) {
      createPhase.mutate(newPhase);
    }
  };

  const handleEdit = (phase: any) => {
    setEditingId(phase.id);
    setEditingPhase({
      phase_name: phase.phase_name,
      description: phase.description || '',
      start_date: phase.start_date || '',
      completion_date: phase.completion_date || ''
    });
  };

  const handleSave = () => {
    if (editingId && editingPhase.phase_name.trim()) {
      updatePhase.mutate({ id: editingId, data: editingPhase });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingPhase({ phase_name: '', description: '', start_date: '', completion_date: '' });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        
        {/* Add new phase */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Add New Timeline Phase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-phase-name">Phase Name *</Label>
              <Input
                id="new-phase-name"
                value={newPhase.phase_name}
                onChange={(e) => setNewPhase(prev => ({ ...prev, phase_name: e.target.value }))}
                placeholder="Enter phase name"
              />
            </div>
            <div>
              <Label htmlFor="new-phase-description">Description</Label>
              <Textarea
                id="new-phase-description"
                value={newPhase.description}
                onChange={(e) => setNewPhase(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter phase description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-start-date">Start Date</Label>
                <Input
                  id="new-start-date"
                  type="date"
                  value={newPhase.start_date}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-completion-date">Completion Date</Label>
                <Input
                  id="new-completion-date"
                  type="date"
                  value={newPhase.completion_date}
                  onChange={(e) => setNewPhase(prev => ({ ...prev, completion_date: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              onClick={handleAdd} 
              className="flex items-center gap-2"
              disabled={!newPhase.phase_name.trim() || createPhase.isPending}
            >
              <Plus className="h-4 w-4" />
              Add Phase
            </Button>
          </CardContent>
        </Card>

        {/* Existing phases */}
        <div className="space-y-4">
          {timeline && timeline.length > 0 ? (
            timeline.map((phase) => (
              <Card key={phase.id}>
                <CardContent className="p-4">
                  {editingId === phase.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`edit-phase-name-${phase.id}`}>Phase Name *</Label>
                        <Input
                          id={`edit-phase-name-${phase.id}`}
                          value={editingPhase.phase_name}
                          onChange={(e) => setEditingPhase(prev => ({ ...prev, phase_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-phase-description-${phase.id}`}>Description</Label>
                        <Textarea
                          id={`edit-phase-description-${phase.id}`}
                          value={editingPhase.description}
                          onChange={(e) => setEditingPhase(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-start-date-${phase.id}`}>Start Date</Label>
                          <Input
                            id={`edit-start-date-${phase.id}`}
                            type="date"
                            value={editingPhase.start_date}
                            onChange={(e) => setEditingPhase(prev => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-completion-date-${phase.id}`}>Completion Date</Label>
                          <Input
                            id={`edit-completion-date-${phase.id}`}
                            type="date"
                            value={editingPhase.completion_date}
                            onChange={(e) => setEditingPhase(prev => ({ ...prev, completion_date: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          disabled={!editingPhase.phase_name.trim() || updatePhase.isPending}
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
                          <Calendar className="h-4 w-4 text-primary" />
                          {phase.phase_name}
                        </h4>
                        {phase.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-6">{phase.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 ml-6 text-sm text-gray-500">
                          {phase.start_date && (
                            <span>Start: {new Date(phase.start_date).toLocaleDateString()}</span>
                          )}
                          {phase.completion_date && (
                            <span>End: {new Date(phase.completion_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(phase)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePhase.mutate(phase.id)}
                          disabled={deletePhase.isPending}
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
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                No timeline phases added yet. Add your first phase above.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
