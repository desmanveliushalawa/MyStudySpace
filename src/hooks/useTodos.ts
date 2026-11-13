import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TodoItem, TodoCategory, Priority } from '@/types/database';
import { toast } from 'sonner';

export function useTodos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<TodoItem[]> => {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return (data || []) as TodoItem[];
    },
  });

  const createTodo = useMutation({
    mutationFn: async (payload: {
      title: string;
      category: TodoCategory;
      due_date?: string | null;
      priority: Priority;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('todo_items')
        .insert({
          user_id: user.id,
          title: payload.title.trim(),
          category: payload.category,
          due_date: payload.due_date || null,
          priority: payload.priority,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TodoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Kegiatan berhasil ditambahkan');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan kegiatan';
      toast.error(msg);
    },
  });

  const toggleTodo = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const nextStatus = !is_completed;
      const { data, error } = await supabase
        .from('todo_items')
        .update({
          is_completed: nextStatus,
          completed_at: nextStatus ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TodoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status to-do';
      toast.error(msg);
    },
  });

  const updateTodo = useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      category: TodoCategory;
      due_date?: string | null;
      priority: Priority;
    }) => {
      const { data, error } = await supabase
        .from('todo_items')
        .update({
          title: payload.title.trim(),
          category: payload.category,
          due_date: payload.due_date || null,
          priority: payload.priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      return data as TodoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Kegiatan berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui kegiatan';
      toast.error(msg);
    },
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('todo_items').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Kegiatan berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus kegiatan';
      toast.error(msg);
    },
  });

  return {
    todos: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  };
}

