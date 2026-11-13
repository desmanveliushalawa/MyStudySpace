import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Reminder, NotificationType, NotificationLeadTime } from '@/types/database';
import { toast } from 'sonner';

export function useReminders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reminders'],
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, task:tasks(*)')
        .order('remind_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Reminder[];
    },
  });

  const createReminder = useMutation({
    mutationFn: async (payload: {
      task_id?: string | null;
      title: string;
      description?: string;
      remind_at: string;
      category?: string;
      notification_type: NotificationType;
      notification_lead_time: NotificationLeadTime;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna belum masuk');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          task_id: payload.task_id || null,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          remind_at: payload.remind_at,
          category: payload.category || 'umum',
          notification_type: payload.notification_type,
          notification_lead_time: payload.notification_lead_time,
          sync_status: 'pending',
        })
        .select('*, task:tasks(*)')
        .single();

      if (error) throw error;
      return data as Reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Pengingat berhasil disimpan');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengingat';
      toast.error(msg);
    },
  });

  const updateReminder = useMutation({
    mutationFn: async (payload: {
      id: string;
      task_id?: string | null;
      title: string;
      description?: string;
      remind_at: string;
      category?: string;
      notification_type: NotificationType;
      notification_lead_time: NotificationLeadTime;
    }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({
          task_id: payload.task_id || null,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          remind_at: payload.remind_at,
          category: payload.category || 'umum',
          notification_type: payload.notification_type,
          notification_lead_time: payload.notification_lead_time,
          sync_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
        .select('*, task:tasks(*)')
        .single();

      if (error) throw error;
      return data as Reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Pengingat berhasil diperbarui');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui pengingat';
      toast.error(msg);
    },
  });

  const toggleReminderComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const next = !is_completed;
      const { data, error } = await supabase
        .from('reminders')
        .update({
          is_completed: next,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Pengingat berhasil dihapus');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus pengingat';
      toast.error(msg);
    },
  });

  const retrySync = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({
          sync_status: 'pending',
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.info('Permintaan sinkronisasi ulang dikirim');
    },
  });

  return {
    reminders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createReminder,
    updateReminder,
    toggleReminderComplete,
    deleteReminder,
    retrySync,
  };
}

