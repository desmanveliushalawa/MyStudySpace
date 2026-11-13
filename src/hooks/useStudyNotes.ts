import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StudyNote, NoteStatus, ReferenceLink } from '@/types/database';
import { toast } from 'sonner';

export function useStudyNotes(selectedDate?: string) {
  const queryClient = useQueryClient();

  // Query catatan untuk tanggal tertentu (atau semua catatan jika tanggal kosong)
  const query = useQuery({
    queryKey: ['study_notes', selectedDate],
    queryFn: async (): Promise<StudyNote[]> => {
      let q = supabase
        .from('study_notes')
        .select('*, subject:subjects(*)');

      if (selectedDate) {
        q = q.eq('note_date', selectedDate);
      }

      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as StudyNote[];
    },
  });

  // Query semua catatan (untuk statistik dan penghitungan progress)
  const allNotesQuery = useQuery({
    queryKey: ['study_notes_all'],
    queryFn: async (): Promise<StudyNote[]> => {
      const { data, error } = await supabase
        .from('study_notes')
        .select('id, title, status, note_date, completed_at, subject_id');
      if (error) throw error;
      return (data || []) as StudyNote[];
    },
  });

  const saveNote = useMutation({
    mutationFn: async (payload: {
      id?: string;
      note_date: string;
      subject_id?: string | null;
      title: string;
      content: Record<string, unknown> | string;
      status: NoteStatus;
      reference_links?: ReferenceLink[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const isCompleted = payload.status === 'selesai';
      const now = new Date().toISOString();

      if (payload.id) {
        // Update existing note
        const { data, error } = await supabase
          .from('study_notes')
          .update({
            subject_id: payload.subject_id || null,
            title: payload.title.trim() || 'Catatan Tanpa Judul',
            content: payload.content,
            status: payload.status,
            reference_links: payload.reference_links || [],
            completed_at: isCompleted ? now : null,
            updated_at: now,
          })
          .eq('id', payload.id)
          .select('*, subject:subjects(*)')
          .single();

        if (error) throw error;
        return data as StudyNote;
      } else {
        // Insert new note
        const { data, error } = await supabase
          .from('study_notes')
          .insert({
            user_id: user.id,
            note_date: payload.note_date,
            subject_id: payload.subject_id || null,
            title: payload.title.trim() || 'Catatan Baru',
            content: payload.content,
            status: payload.status,
            reference_links: payload.reference_links || [],
            completed_at: isCompleted ? now : null,
          })
          .select('*, subject:subjects(*)')
          .single();

        if (error) throw error;
        return data as StudyNote;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['study_notes'] });
      queryClient.invalidateQueries({ queryKey: ['study_notes_all'] });
      return data;
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan catatan';
      toast.error(msg);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('study_notes').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_notes'] });
      queryClient.invalidateQueries({ queryKey: ['study_notes_all'] });
      toast.success('Catatan berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus catatan';
      toast.error(msg);
    },
  });

  return {
    notes: query.data || [],
    allNotes: allNotesQuery.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    saveNote,
    deleteNote,
  };
}

