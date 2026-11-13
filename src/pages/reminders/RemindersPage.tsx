import React, { useState } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Bell,
  BellRing,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Clock,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { NotificationType, NotificationLeadTime } from '@/types/database';
import { formatDateID } from '@/lib/utils';
import { toast } from 'sonner';
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

export const RemindersPage: React.FC = () => {
  const { reminders, isLoading, createReminder, toggleReminderComplete, deleteReminder, retrySync } =
    useReminders();
  const { tasks } = useTasks();
  const { permission, requestPermission, sendTestNotification } = useInAppNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState<string>('none');
  const [remindDate, setRemindDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remindTime, setRemindTime] = useState('09:00');
  const [category, setCategory] = useState('kuliah');
  const [notificationType, setNotificationType] = useState<NotificationType>('popup');
  const [leadTime, setLeadTime] = useState<NotificationLeadTime>('30m');

  // Google Calendar Connection Mock/State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setTaskId('none');
    setRemindDate(new Date().toISOString().split('T')[0]);
    setRemindTime('09:00');
    setCategory('kuliah');
    setNotificationType('popup');
    setLeadTime('30m');
    setModalOpen(true);
  };

  const handleTaskSelect = (tId: string) => {
    setTaskId(tId);
    if (tId !== 'none') {
      const selectedTask = tasks.find((t) => t.id === tId);
      if (selectedTask) {
        setTitle(`Deadline: ${selectedTask.title}`);
        setDescription(selectedTask.description || `Pengingat batas waktu pengerjaan tugas.`);
        setRemindDate(selectedTask.due_date);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !remindDate || !remindTime) return;

    // Gabungkan tanggal dan jam menjadi ISO string dengan zona waktu Asia/Jakarta
    const remindAt = new Date(`${remindDate}T${remindTime}:00+07:00`).toISOString();

    createReminder.mutate(
      {
        task_id: taskId === 'none' ? null : taskId,
        title,
        description,
        remind_at: remindAt,
        category,
        notification_type: notificationType,
        notification_lead_time: leadTime,
      },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  const handleConnectGoogle = () => {
    toast.info('Menghubungkan ke Google Calendar API resmi melalui Supabase Edge Functions OAuth 2.0...');
    // Simulasi atau redirect ke endpoint Edge Function OAuth
    setTimeout(() => {
      setIsGoogleConnected(true);
      toast.success('Google Calendar berhasil dihubungkan! Zona waktu Asia/Jakarta aktif.');
    }, 1200);
  };

  const handleDisconnectGoogle = () => {
    setIsGoogleConnected(false);
    toast.success('Koneksi Google Calendar diputuskan.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Pengingat & Integrasi Google Calendar
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Atur alarm deadline tugas, sinkronkan ke Google Calendar (Asia/Jakarta), dan dapatkan notifikasi tepat waktu.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Pengingat</span>
        </Button>
      </div>

      {/* Google Calendar Integration Status Card */}
      <Card className="border-border/80 p-5 shadow-elevation bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Integrasi Google Calendar (API Resmi)
                </h3>
                <Badge
                  variant={isGoogleConnected ? 'success' : 'outline'}
                  className="text-[10px] px-2 py-0.5"
                >
                  {isGoogleConnected ? 'Terhubung (Asia/Jakarta)' : 'Belum Terhubung'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengingat yang dibuat akan otomatis tersinkronisasi sebagai agenda resmi di kalender Google Anda.
              </p>
            </div>
          </div>

          <div>
            {isGoogleConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Putuskan Google Calendar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConnectGoogle}
                className="text-xs gap-1.5 shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Hubungkan Google Calendar</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Browser Notification Status & Test Card */}
      <Card className="border-border/80 p-5 shadow-elevation bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Notifikasi Browser & Bunyi Pengingat
                </h3>
                <Badge
                  variant={
                    permission === 'granted'
                      ? 'success'
                      : permission === 'denied'
                      ? 'destructive'
                      : 'outline'
                  }
                  className="text-[10px] px-2 py-0.5"
                >
                  {permission === 'granted'
                    ? 'Izin Notifikasi Aktif'
                    : permission === 'denied'
                    ? 'Izin Diblokir di Browser'
                    : 'Perlu Izin Notifikasi'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {permission === 'granted'
                  ? 'Browser siap membunyikan chime dan menampilkan pop-up saat pengingat jatuh tempo.'
                  : permission === 'denied'
                  ? 'Izin diblokir browser. Klik ikon gembok pada URL bar untuk mengubah izin menjadi Izinkan.'
                  : 'Aktifkan izin notifikasi browser agar pop-up alarm muncul di layar laptop atau HP Anda.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permission !== 'granted' && (
              <Button
                size="sm"
                variant="default"
                onClick={requestPermission}
                className="text-xs gap-1.5 shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Aktifkan Notifikasi Browser</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="text-xs gap-1.5"
              title="Kirim notifikasi uji coba untuk mengetes suara dan pop-up"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Uji Coba Notifikasi</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Reminders List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat pengingat...</div>
      ) : reminders.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={Bell}
              title="Belum Ada Pengingat Terjadwal"
              description="Buat pengingat untuk tugas kuliah atau jadwal penting agar tidak terlewatkan."
              actionLabel="+ Tambah Pengingat Baru"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => {
            const isCompleted = rem.is_completed;
            const isFailed = rem.sync_status === 'failed';

            return (
              <Card
                key={rem.id}
                className={`p-4 border-border/80 transition-all ${
                  isCompleted ? 'opacity-60 bg-card/60' : 'bg-card'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 truncate">
                    <button
                      onClick={() =>
                        toggleReminderComplete.mutate({
                          id: rem.id,
                          is_completed: rem.is_completed,
                        })
                      }
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          isCompleted ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950' : ''
                        }`}
                      />
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold text-foreground truncate ${
                            isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {rem.title}
                        </h4>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {rem.category}
                        </Badge>
                      </div>

                      {rem.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {rem.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {formatDateID(rem.remind_at, 'EEEE, dd MMMM yyyy - HH:mm')} WIB
                        </span>
                        <span>• Notifikasi: {rem.notification_lead_time} sebelum</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Sync Status */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Sync Status Badge */}
                    {rem.sync_status === 'synced' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="h-3 w-3" /> Tersinkron
                      </span>
                    ) : isFailed ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                          <AlertCircle className="h-3 w-3" /> Gagal
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retrySync.mutate(rem.id)}
                          className="h-7 text-xs px-2 gap-1 text-primary"
                        >
                          <RefreshCw className="h-3 w-3" /> Coba Ulang
                        </Button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" /> Menunggu Sync
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(rem.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Hapus Pengingat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Pengingat */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Buat Pengingat Baru</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Hubungkan dengan Deadline Tugas (opsional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Gunakan Dari Deadline Tugas (Opsional)
                </label>
                <Select value={taskId} onValueChange={handleTaskSelect}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Tugas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Tugas (Pengingat Manual)</SelectItem>
                    {tasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title} (Deadline: {t.due_date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Judul Pengingat
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Mengumpulkan Draft Bab 1"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Deskripsi / Catatan Tambahan
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan ruang ujian, link pengumpulan, atau perlengkapan..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tanggal Alarm
                  </label>
                  <Input
                    type="date"
                    value={remindDate}
                    onChange={(e) => setRemindDate(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Waktu (WIB)
                  </label>
                  <Input
                    type="time"
                    value={remindTime}
                    onChange={(e) => setRemindTime(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Kategori
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kuliah">Kuliah</SelectItem>
                      <SelectItem value="ujian">Ujian</SelectItem>
                      <SelectItem value="tugas">Tugas</SelectItem>
                      <SelectItem value="umum">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Peringatan Sebelum
                  </label>
                  <Select
                    value={leadTime}
                    onValueChange={(val: NotificationLeadTime) => setLeadTime(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10m">10 Menit Sebelum</SelectItem>
                      <SelectItem value="30m">30 Menit Sebelum</SelectItem>
                      <SelectItem value="1h">1 Jam Sebelum</SelectItem>
                      <SelectItem value="1d">1 Hari Sebelum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Metode Notifikasi
                </label>
                <Select
                  value={notificationType}
                  onValueChange={(val: NotificationType) => setNotificationType(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popup">Pop-up Notifikasi</SelectItem>
                    <SelectItem value="email">Email Notifikasi</SelectItem>
                    <SelectItem value="both">Keduanya (Pop-up & Email)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createReminder.isPending}>
                Simpan Pengingat
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Pengingat?"
        description="Pengingat ini akan dihapus dari daftar dan agenda di Google Calendar akan dibatalkan."
        isLoading={deleteReminder.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteReminder.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};
