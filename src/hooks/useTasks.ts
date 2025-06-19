
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  status: string;
  priority: string;
  assignee: string;
  assigneeRole: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        project: t.projects?.name || 'No Project',
        status: t.status,
        priority: t.priority,
        assignee: t.assignee || '',
        assigneeRole: t.assignee_role || '',
        dueDate: t.due_date || '',
        estimatedHours: t.estimated_hours || 0,
        actualHours: t.actual_hours || 0
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: userData.user.id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee: taskData.assignee,
          assignee_role: taskData.assigneeRole,
          due_date: taskData.dueDate || null,
          estimated_hours: taskData.estimatedHours,
          actual_hours: taskData.actualHours
        });

      if (error) throw error;

      await fetchTasks();
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });

      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    createTask,
    refetch: fetchTasks
  };
};
