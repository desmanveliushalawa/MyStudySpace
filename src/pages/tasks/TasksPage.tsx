import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckSquare, Plus, Edit2, Trash2, CheckCircle2, Clock, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Task, Priority, TaskStatus } from '@/types/database';
import { getPriorityColor } from '@/lib/utils';

export const TasksPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const { tasks, isLoading, createTask, updateTask, toggleTaskStatus, deleteTask } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    subjectId: subjectFilter,
  });
  const { subjects } = useSubjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>('none');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('sedang');
  const [status, setStatus] = useState<TaskStatus>('belum_dikerjakan');

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubjectId('none');
    setStartDate('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('sedang');
    setStatus('belum_dikerjakan');
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubjectId(task.subject_id || 'none');
    setStartDate(task.start_date || '');
    setDueDate(task.due_date);
    setPriority(task.priority);
    setStatus(task.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const payload = {
      title,
      description,
      subject_id: subjectId === 'none' ? null : subjectId,
      start_date: startDate || null,
      due_date: dueDate,
      priority,
      status,
    };

    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, ...payload },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createTask.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Manajemen Tugas Perkuliahan
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola seluruh tugas kuliah, pantau deadline terdekat, dan urutkan berdasarkan prioritas.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Tugas Baru</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border/80 shadow-elevation">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>

        {/* Filter Status */}
        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status Tugas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="belum_dikerjakan">Belum Dikerjakan</SelectItem>
              <SelectItem value="sedang_dikerjakan">Sedang Dikerjakan</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Prioritas */}
        <div className="w-36">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="tinggi">Tinggi</SelectItem>
              <SelectItem value="sedang">Sedang</SelectItem>
              <SelectItem value="rendah">Rendah</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Mata Kuliah */}
        <div className="w-44">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Mata Kuliah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mata Kuliah</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-xs text-muted-foreground">
          Menampilkan <strong className="text-foreground">{tasks.length}</strong> tugas
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat daftar tugas...</div>
      ) : tasks.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={CheckSquare}
              title="Tidak Ada Tugas"
              description="Tidak ada tugas perkuliahan yang cocok dengan filter yang Anda pilih."
              actionLabel="+ Buat Tugas Baru"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const pColor = getPriorityColor(task.priority);
            const isCompleted = task.status === 'selesai';

            return (
              <Card
                key={task.id}
                className={`floating-card border-border/80 transition-all ${
                  isCompleted ? 'opacity-70 bg-card/60' : 'bg-card'
                }`}
              >
                <div className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Top: Status Checkbox & Actions */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {task.subject && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${task.subject.color}15`,
                              color: task.subject.color,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: task.subject.color }}
                            />
                            {task.subject.name}
                          </span>
                        )}
                        <Badge
                          className={`text-[10px] px-2 py-0.5 border ${pColor.bg} ${pColor.text} ${pColor.border}`}
                        >
                          {pColor.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(task)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Ubah tugas"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(task.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Hapus tugas"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h3
                      className={`text-base font-bold text-foreground leading-snug ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Deadline & Toggle Status */}
                  <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{task.due_date}</span>
                    </div>

                    <Button
                      size="sm"
                      variant={isCompleted ? 'secondary' : 'outline'}
                      onClick={() =>
                        toggleTaskStatus.mutate({
                          id: task.id,
                          currentStatus: task.status,
                        })
                      }
                      className="h-8 text-xs gap-1.5"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Selesai</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Tandai Selesai</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Perbarui Tugas Perkuliahan' : 'Tambah Tugas Perkuliahan Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Tugas
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Laporan Praktikum Jaringan Komputer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Deskripsi / Petunjuk Pengerjaan
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambahkan catatan instruksi dosen atau referensi tugas..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Mata Kuliah
                  </label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Matkul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Mata Kuliah</SelectItem>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Prioritas
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(val: Priority) => setPriority(val)}
                  >
                    <SelectTrigger className="h-9 text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendah">Rendah</SelectItem>
                      <SelectItem value="sedang">Sedang</SelectItem>
                      <SelectItem value="tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tanggal Mulai (Opsional)
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Deadline (Wajib)
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Status Pengerjaan
                </label>
                <Select
                  value={status}
                  onValueChange={(val: TaskStatus) => setStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum_dikerjakan">Belum Dikerjakan</SelectItem>
                    <SelectItem value="sedang_dikerjakan">Sedang Dikerjakan</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createTask.isPending || updateTask.isPending}
              >
                {editingTask ? 'Simpan Perubahan' : 'Tambahkan Tugas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Tugas Perkuliahan?"
        description="Tugas ini akan dihapus dari daftar. Pengingat kalender yang terhubung dengan tugas ini juga akan terhapus."
        isLoading={deleteTask.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteTask.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};
