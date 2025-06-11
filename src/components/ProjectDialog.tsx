
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectDialogProps {
  onProjectCreate: (project: any) => void;
}

const ProjectDialog = ({ onProjectCreate }: ProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    manager: 'Ahmed Al-Rashid',
    dueDate: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newProject = {
      id: Date.now(),
      ...formData,
      team: ['Ahmed Al-Rashid'],
      progress: 0,
      tasksCount: 0,
      completedTasks: 0,
    };

    onProjectCreate(newProject);
    setOpen(false);
    setFormData({
      name: '',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      manager: 'Ahmed Al-Rashid',
      dueDate: '',
    });

    toast({
      title: "Success",
      description: "Project created successfully!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="To Do">To Do</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Project Manager</Label>
            <select
              id="manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full h-10 px-3 py-2 text-sm border rounded-md border-input bg-background"
            >
              <option value="Ahmed Al-Rashid">Ahmed Al-Rashid</option>
              <option value="Sara Al-Mahmoud">Sara Al-Mahmoud</option>
              <option value="Mohammed Al-Faisal">Mohammed Al-Faisal</option>
              <option value="Fatima Al-Zahra">Fatima Al-Zahra</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
