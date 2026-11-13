import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getPriorityColor } from '@/lib/utils';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, isLoading, addProjectTask, toggleProjectTask, deleteProjectTask, deleteProject } =
    useProjects();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Memuat detail proyek...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Proyek tidak ditemukan atau telah dihapus.</p>
        <Button asChild size="sm">
          <Link to="/projects">Kembali ke Daftar Proyek</Link>
        </Button>
      </div>
    );
  }

  const pColor = getPriorityColor(project.priority);
  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t) => t.is_completed);
  const progress = project.progress_percent || 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !id) return;
    addProjectTask.mutate({
      projectId: id,
      title: newSubtaskTitle.trim(),
    });
    setNewSubtaskTitle('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <Button asChild variant="ghost" size="sm" className="gap-2 text-xs">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Proyek</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteConfirmOpen(true)}
          className="text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Hapus Proyek
        </Button>
      </div>

      {/* Main Project Card Header */}
      <Card className="border-border/80 p-6 shadow-elevation space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs px-2.5 py-0.5 border ${pColor.bg} ${pColor.text} ${pColor.border}`}>
              Prioritas {pColor.label}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Mulai: {project.start_date}
              </span>
            )}
            {project.due_date && (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Deadline: {project.due_date}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress Bar Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-muted-foreground">Kalkulasi Progress Pengerjaan</span>
            <span className="text-base font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {completedTasks.length} dari {tasks.length} sub-tugas telah diselesaikan
          </p>
        </div>
      </Card>

      {/* Sub-Tasks Management Section */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Daftar Sub-Tugas Proyek
          </CardTitle>
          <CardDescription className="text-xs">
            Pecah proyek ini menjadi milestone dan checklist langkah kerja praktis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add Sub-task form */}
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Tambahkan sub-tugas baru (misal: Bab 1 Pendahuluan)..."
              className="text-xs h-9"
            />
            <Button
              type="submit"
              size="sm"
              disabled={addProjectTask.isPending || !newSubtaskTitle.trim()}
              className="h-9 px-4 text-xs gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </Button>
          </form>

          {/* Subtasks checklist */}
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              Belum ada sub-tugas di dalam proyek ini. Tambahkan checklist di atas untuk mulai memantau progress.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {tasks.map((st) => (
                <div
                  key={st.id}
                  className={`flex items-center justify-between p-3 rounded-lg border border-border/80 bg-card transition-all ${
                    st.is_completed ? 'opacity-60 bg-secondary/30' : 'hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Checkbox
                      checked={st.is_completed}
                      onCheckedChange={() =>
                        toggleProjectTask.mutate({
                          id: st.id,
                          is_completed: st.is_completed,
                        })
                      }
                    />
                    <span
                      className={`text-xs font-medium text-foreground truncate ${
                        st.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProjectTask.mutate(st.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    title="Hapus sub-tugas"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Hapus Proyek Ini?"
        description={`Seluruh data proyek "${project.name}" beserta ${tasks.length} sub-tugas di dalamnya akan dihapus secara permanen.`}
        isLoading={deleteProject.isPending}
        onConfirm={() => {
          if (id) {
            deleteProject.mutate(id, {
              onSuccess: () => navigate('/projects'),
            });
          }
        }}
      />
    </div>
  );
};
