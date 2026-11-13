import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StudySession, SessionStatus } from '@/types/database';
import { toast } from 'sonner';

export function useStudySessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['study_sessions'],
    queryFn: async (): Promise<StudySession[]> => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*, subject:subjects(*)')
        .order('start_at', { ascending: false });

      if (error) throw error;
      return (data || []) as StudySession[];
    },
  });

  const logSession = useMutation({
    mutationFn: async (payload: {
      subject_id?: string | null;
      title: string;
      start_at: string;
      end_at?: string | null;
      duration_minutes: number;
      status?: SessionStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: payload.subject_id || null,
          title: payload.title.trim(),
          start_at: payload.start_at,
          end_at: payload.end_at || new Date().toISOString(),
          duration_minutes: payload.duration_minutes,
          status: payload.status || 'completed',
          completed_at: new Date().toISOString(),
        })
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as StudySession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_sessions'] });
      toast.success('Sesi belajar berhasil dicatat');
    },
  });

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    logSession,
  };
}

