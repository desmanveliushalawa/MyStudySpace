import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, Priority, TaskStatus } from '@/types/database';
import { toast } from 'sonner';

export function useTasks(filters?: { status?: string; priority?: string; subjectId?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async (): Promise<Task[]> => {
      let q = supabase
        .from('tasks')
        .select('*, subject:subjects(*)');

      if (filters?.status && filters.status !== 'all') {
        q = q.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        q = q.eq('priority', filters.priority);
      }
      if (filters?.subjectId && filters.subjectId !== 'all') {
        q = q.eq('subject_id', filters.subjectId);
      }

      const { data, error } = await q.order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []) as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      subject_id?: string | null;
      start_date?: string | null;
      due_date: string;
      priority: Priority;
      status: TaskStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const isDone = payload.status === 'selesai';
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          subject_id: payload.subject_id || null,
          start_date: payload.start_date || null,
          due_date: payload.due_date,
          priority: payload.priority,
          status: payload.status,
          completed_at: isDone ? new Date().toISOString() : null,
        })
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tugas berhasil ditambahkan');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan tugas';
      toast.error(msg);
    },
  });

  const updateTask = useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      description?: string;
      subject_id?: string | null;
      start_date?: string | null;
      due_date: string;
      priority: Priority;
      status: TaskStatus;
    }) => {
      const isDone = payload.status === 'selesai';
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          subject_id: payload.subject_id || null,
          start_date: payload.start_date || null,
          due_date: payload.due_date,
          priority: payload.priority,
          status: payload.status,
          completed_at: isDone ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tugas berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui tugas';
      toast.error(msg);
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: TaskStatus }) => {
      const newStatus: TaskStatus = currentStatus === 'selesai' ? 'belum_dikerjakan' : 'selesai';
      const isDone = newStatus === 'selesai';

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed_at: isDone ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const statusText = data.status === 'selesai' ? 'selesai' : 'aktif kembali';
      toast.success(`Tugas ditandai ${statusText}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status tugas';
      toast.error(msg);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tugas berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus tugas';
      toast.error(msg);
    },
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  };
}

