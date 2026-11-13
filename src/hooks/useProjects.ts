import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus, Priority } from '@/types/database';
import { calculateProgress } from '@/lib/utils';
import { toast } from 'sonner';

export function useProjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, tasks:project_tasks(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((proj) => {
        const subtasks = proj.tasks || [];
        const progress = calculateProgress(subtasks);
        return {
          ...proj,
          tasks: subtasks,
          task_count: subtasks.length,
          completed_task_count: subtasks.filter((t: { is_completed: boolean }) => t.is_completed).length,
          progress_percent: progress,
        };
      }) as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      start_date?: string | null;
      due_date?: string | null;
      priority: Priority;
      status: ProjectStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          start_date: payload.start_date || null,
          due_date: payload.due_date || null,
          priority: payload.priority,
          status: payload.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyek baru berhasil dibuat');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal membuat proyek';
      toast.error(msg);
    },
  });

  const updateProject = useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      description?: string;
      start_date?: string | null;
      due_date?: string | null;
      priority: Priority;
      status: ProjectStatus;
    }) => {
      const isDone = payload.status === 'selesai';
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: payload.name.trim(),
          description: payload.description?.trim() || null,
          start_date: payload.start_date || null,
          due_date: payload.due_date || null,
          priority: payload.priority,
          status: payload.status,
          completed_at: isDone ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyek berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui proyek';
      toast.error(msg);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyek berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus proyek';
      toast.error(msg);
    },
  });

  // Manajemen Sub-Tugas di dalam Proyek
  const addProjectTask = useMutation({
    mutationFn: async ({ projectId, title }: { projectId: string; title: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          user_id: user.id,
          project_id: projectId,
          title: title.trim(),
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan sub-tugas';
      toast.error(msg);
    },
  });

  const toggleProjectTask = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const nextStatus = !is_completed;
      const { data, error } = await supabase
        .from('project_tasks')
        .update({
          is_completed: nextStatus,
          completed_at: nextStatus ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_tasks').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createProject,
    updateProject,
    deleteProject,
    addProjectTask,
    toggleProjectTask,
    deleteProjectTask,
  };
}

