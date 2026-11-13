import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderKanban, Plus, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { Project, Priority, ProjectStatus } from '@/types/database';
import { getPriorityColor } from '@/lib/utils';

export const ProjectsPage: React.FC = () => {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('sedang');
  const [status, setStatus] = useState<ProjectStatus>('belum_dimulai');

  const handleOpenCreate = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setPriority('sedang');
    setStatus('belum_dimulai');
    setModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, proj: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setStartDate(proj.start_date || '');
    setDueDate(proj.due_date || '');
    setPriority(proj.priority);
    setStatus(proj.status);
    setModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      description,
      start_date: startDate || null,
      due_date: dueDate || null,
      priority,
      status,
    };

    if (editingProject) {
      updateProject.mutate(
        { id: editingProject.id, ...payload },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createProject.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const getStatusLabel = (st: ProjectStatus) => {
    switch (st) {
      case 'selesai':
        return 'Selesai';
      case 'sedang_berjalan':
        return 'Sedang Berjalan';
      default:
        return 'Belum Dimulai';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            Manajemen Proyek Belajar
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola target proyek, pantau sub-tugas, dan kalkulasi progress pengerjaan otomatis.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Proyek Baru</span>
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat daftar proyek...</div>
      ) : projects.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={FolderKanban}
              title="Belum Ada Proyek"
              description="Buat proyek belajar pertama Anda untuk memecah target besar menjadi sub-tugas yang terukur."
              actionLabel="+ Tambah Proyek Baru"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const pColor = getPriorityColor(proj.priority);
            const progress = proj.progress_percent || 0;

            return (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group block focus:outline-none"
              >
                <Card className="floating-card h-full flex flex-col justify-between border-border/80 p-5 group-hover:border-primary/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={`text-[10px] px-2 py-0.5 border ${pColor.bg} ${pColor.text} ${pColor.border}`}
                      >
                        {pColor.label}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenEdit(e, proj)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Ubah proyek"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, proj.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Hapus proyek"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {proj.name}
                    </h3>

                    {proj.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/80 space-y-3 mt-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-bold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Sub-tasks count & Status */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>
                        {proj.completed_task_count || 0}/{proj.task_count || 0} sub-tugas
                      </span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        {getStatusLabel(proj.status)}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Proyek */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Perbarui Proyek' : 'Tambah Proyek Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Proyek
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Proyek Penelitian Machine Learning"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Deskripsi Proyek
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan ringkasan tujuan atau milestone proyek..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Status Proyek
                  </label>
                  <Select
                    value={status}
                    onValueChange={(val: ProjectStatus) => setStatus(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="belum_dimulai">Belum Dimulai</SelectItem>
                      <SelectItem value="sedang_berjalan">Sedang Berjalan</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tanggal Mulai
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
                    Deadline Proyek
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createProject.isPending || updateProject.isPending}
              >
                {editingProject ? 'Simpan Perubahan' : 'Buat Proyek'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Proyek?"
        description="Seluruh sub-tugas yang ada di dalam proyek ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
        isLoading={deleteProject.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteProject.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};
