import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QuickNote } from '@/types/database';
import { toast } from 'sonner';

export function useQuickNotes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quick_notes'],
    queryFn: async (): Promise<QuickNote[]> => {
      const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as QuickNote[];
    },
  });

  const createQuickNote = useMutation({
    mutationFn: async ({ content, color }: { content: string; color?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('quick_notes')
        .insert({
          user_id: user.id,
          content: content.trim(),
          color: color || '#FAF8F5',
        })
        .select()
        .single();

      if (error) throw error;
      return data as QuickNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick_notes'] });
      toast.success('Catatan singkat disimpan');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan catatan singkat';
      toast.error(msg);
    },
  });

  const updateQuickNote = useMutation({
    mutationFn: async ({ id, content, color }: { id: string; content: string; color?: string }) => {
      const { data, error } = await supabase
        .from('quick_notes')
        .update({
          content: content.trim(),
          color: color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as QuickNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick_notes'] });
    },
  });

  const deleteQuickNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quick_notes').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick_notes'] });
      toast.success('Catatan dihapus');
    },
  });

  return {
    quickNotes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createQuickNote,
    updateQuickNote,
    deleteQuickNote,
  };
}

