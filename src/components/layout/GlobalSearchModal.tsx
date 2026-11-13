import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, CheckSquare, FolderKanban, Loader2 } from 'lucide-react';
import { StudyNote, Task, Project } from '@/types/database';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setNotes([]);
      setTasks([]);
      setProjects([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [notesRes, tasksRes, projectsRes] = await Promise.all([
          supabase
            .from('study_notes')
            .select('id, title, note_date, status')
            .ilike('title', `%${query}%`)
            .limit(5),
          supabase
            .from('tasks')
            .select('id, title, due_date, priority, status')
            .ilike('title', `%${query}%`)
            .limit(5),
          supabase
            .from('projects')
            .select('id, name, status, priority')
            .ilike('name', `%${query}%`)
            .limit(5),
        ]);

        if (notesRes.data) setNotes(notesRes.data as StudyNote[]);
        if (tasksRes.data) setTasks(tasksRes.data as Task[]);
        if (projectsRes.data) setProjects(projectsRes.data as Project[]);
      } catch {
        // Fallback pencarian
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const hasResults = notes.length > 0 || tasks.length > 0 || projects.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Pencarian Global</DialogTitle>
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari materi, tugas, atau proyek..."
            className="border-0 shadow-none focus-visible:ring-0 px-0 h-9 text-base bg-transparent"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <p className="text-sm text-center text-muted-foreground py-6">
              Ketik minimal 2 karakter untuk memulai pencarian di seluruh dashboard.
            </p>
          )}

          {query && !loading && !hasResults && (
            <p className="text-sm text-center text-muted-foreground py-6">
              Tidak ada hasil yang cocok dengan &quot;{query}&quot;.
            </p>
          )}

          {/* Catatan Pelajaran */}
          {notes.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                Catatan Pelajaran
              </h5>
              <div className="space-y-1">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelect(`/lessons?date=${note.note_date}`)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">{note.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{note.note_date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tugas Perkuliahan */}
          {tasks.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                Tugas Perkuliahan
              </h5>
              <div className="space-y-1">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelect('/tasks')}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">Deadline: {task.due_date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Proyek */}
          {projects.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                Proyek
              </h5>
              <div className="space-y-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSelect(`/projects/${proj.id}`)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderKanban className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">{proj.name}</span>
                    </div>
                    <span className="text-xs capitalize text-muted-foreground shrink-0">
                      {proj.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

