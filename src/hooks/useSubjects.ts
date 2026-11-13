import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/types/database';
import { toast } from 'sonner';

export function useSubjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subjects'],
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as Subject[];
    },
  });

  const createSubject = useMutation({
    mutationFn: async (payload: { name: string; code?: string; color: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: payload.name.trim(),
          code: payload.code?.trim() || null,
          color: payload.color || '#8A9A86',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Mata kuliah berhasil ditambahkan');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan mata kuliah';
      toast.error(msg);
    },
  });

  const updateSubject = useMutation({
    mutationFn: async (payload: { id: string; name: string; code?: string; color: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          name: payload.name.trim(),
          code: payload.code?.trim() || null,
          color: payload.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Mata kuliah berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui mata kuliah';
      toast.error(msg);
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Mata kuliah berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus mata kuliah';
      toast.error(msg);
    },
  });

  return {
    subjects: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}

