
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  manager: string;
  team: string[];
  dueDate: string;
  progress: number;
  tasksCount: number;
  completedTasks: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        status: p.status,
        priority: p.priority,
        manager: p.manager || '',
        team: Array.isArray(p.team) ? p.team as string[] : [],
        dueDate: p.due_date || '',
        progress: p.progress || 0,
        tasksCount: p.tasks_count || 0,
        completedTasks: p.completed_tasks || 0
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: userData.user.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          manager: projectData.manager,
          team: projectData.team,
          due_date: projectData.dueDate || null,
          progress: projectData.progress,
          tasks_count: projectData.tasksCount,
          completed_tasks: projectData.completedTasks
        });

      if (error) throw error;

      await fetchProjects();
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });

      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProject = async (projectData: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          manager: projectData.manager,
          team: projectData.team,
          due_date: projectData.dueDate || null,
          progress: projectData.progress,
          tasks_count: projectData.tasksCount,
          completed_tasks: projectData.completedTasks
        })
        .eq('id', projectData.id);

      if (error) throw error;

      await fetchProjects();
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    refetch: fetchProjects
  };
};
