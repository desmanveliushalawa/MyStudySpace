import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useQuickNotes } from '@/hooks/useQuickNotes';
import { useReminders } from '@/hooks/useReminders';
import { getTimeGreeting, formatDateID, getPriorityColor } from '@/lib/utils';
import {
  BookOpen,
  CheckCircle,
  Clock,
  FolderKanban,
  Calendar as CalendarIcon,
  Plus,
  StickyNote,
  ChevronRight,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { allNotes } = useStudyNotes();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { quickNotes, createQuickNote } = useQuickNotes();
  const { reminders } = useReminders();

  const [newQuickNote, setNewQuickNote] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Desman Halawa';
  const greeting = getTimeGreeting();

  // Metrics calculation
  const totalNotes = allNotes.length;
  const completedNotes = allNotes.filter((n) => n.status === 'selesai').length;
  const studyProgress = totalNotes > 0 ? Math.round((completedNotes / totalNotes) * 100) : 0;

  const pendingTasks = tasks.filter((t) => t.status !== 'selesai');
  const completedTasks = tasks.filter((t) => t.status === 'selesai');
  const activeProjects = projects.filter((p) => p.status !== 'selesai');

  // Mini calendar days for current month
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const monthDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });

  // Upcoming deadlines (tasks + reminders)
  const upcomingDeadlines = pendingTasks.slice(0, 4);

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickNote.trim()) return;
    createQuickNote.mutate({ content: newQuickNote.trim() });
    setNewQuickNote('');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-elevation">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Flame className="h-3.5 w-3.5" />
            <span>Fokus Belajar Hari Ini</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDateID(new Date(), "EEEE, dd MMMM yyyy")} • Tetap konsisten dan pantau target akademik Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 shadow-sm">
            <Link to="/lessons">
              <Plus className="h-4 w-4" />
              <span>Tulis Catatan</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/tasks">
              <span>Tambah Tugas</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Materi */}
        <Card className="floating-card border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Materi
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalNotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedNotes} materi terselesaikan
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Tugas Belum Selesai */}
        <Card className="floating-card border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tugas Tertunda
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Perlu dikerjakan segera
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Tugas Selesai */}
        <Card className="floating-card border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tugas Tuntas
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total tugas diselesaikan
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Proyek Aktif */}
        <Card className="floating-card border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Proyek Aktif
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderKanban className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sedang dalam pengerjaan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Belajar Bar */}
      <Card className="border-border/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Progress Penyelesaian Materi Belajar
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedNotes} dari {totalNotes} materi perkuliahan telah ditandai selesai
            </p>
          </div>
          <span className="text-lg font-bold text-primary">{studyProgress}%</span>
        </div>
        <Progress value={studyProgress} className="h-2.5" />
      </Card>

      {/* Grid: Mini Kalender & Jadwal Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Mini Kalender & Deadline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mini Kalender */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Kalender Belajar ({format(new Date(), 'MMMM yyyy', { locale: id })})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Klik tanggal untuk melihat jadwal atau membuat catatan materi
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/lessons">
                  Buka Pelajaran <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
                <div>Min</div>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrent = isToday(day);
                  const isSelected = isSameDay(day, selectedCalendarDate);
                  const hasNote = allNotes.some((n) => n.note_date === dayStr);
                  const hasTask = tasks.some((t) => t.due_date === dayStr);

                  return (
                    <button
                      key={dayStr}
                      onClick={() => setSelectedCalendarDate(day)}
                      className={`relative flex flex-col items-center justify-center h-10 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                          : isCurrent
                          ? 'bg-secondary text-primary font-bold border border-primary/40'
                          : 'hover:bg-secondary/60 text-foreground'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>
                      <div className="flex gap-0.5 mt-0.5">
                        {hasNote && (
                          <span
                            className={`h-1 w-1 rounded-full ${
                              isSelected ? 'bg-primary-foreground' : 'bg-primary'
                            }`}
                          />
                        )}
                        {hasTask && (
                          <span
                            className={`h-1 w-1 rounded-full ${
                              isSelected ? 'bg-amber-200' : 'bg-amber-500'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected date action button */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Tanggal dipilih: <strong className="text-foreground">{formatDateID(selectedCalendarDate, 'EEEE, d MMMM yyyy')}</strong>
                </span>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link to={`/lessons?date=${format(selectedCalendarDate, 'yyyy-MM-dd')}`}>
                    Buka Catatan Tanggal Ini
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deadline & Jadwal Terdekat */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Deadline Terdekat
                </CardTitle>
                <CardDescription className="text-xs">
                  Tugas dan pengingat yang mendekati batas waktu
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/tasks">
                  Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="Tidak Ada Deadline Mendesak"
                  description="Semua tugas perkuliahan telah terselesaikan atau belum ada deadline terdekat."
                />
              ) : (
                <div className="space-y-2.5">
                  {upcomingDeadlines.map((task) => {
                    const pColor = getPriorityColor(task.priority);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-card/60 hover:bg-card transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: task.subject?.color || '#8A9A86' }}
                            title={task.subject?.name || 'Mata Kuliah'}
                          />
                          <div className="truncate">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {task.subject?.name || 'Umum'} • Deadline: {task.due_date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            className={`text-[10px] px-2 py-0.5 border ${pColor.bg} ${pColor.text} ${pColor.border}`}
                          >
                            {pColor.label}
                          </Badge>
                          <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                            <Link to="/tasks">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Catatan Singkat & Pengingat */}
        <div className="space-y-6">
          {/* Quick Notes Card */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" />
                Catatan Singkat (Quick Notes)
              </CardTitle>
              <CardDescription className="text-xs">
                Tulis ide spontan atau catatan cepat tanpa membuka menu
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <form onSubmit={handleAddQuickNote} className="space-y-2">
                <textarea
                  value={newQuickNote}
                  onChange={(e) => setNewQuickNote(e.target.value)}
                  placeholder="Ketik catatan kilat di sini..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-input bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="w-full text-xs h-8"
                  disabled={createQuickNote.isPending || !newQuickNote.trim()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Simpan Catatan Kilat
                </Button>
              </form>

              <div className="space-y-2 pt-2 max-h-56 overflow-y-auto">
                {quickNotes.slice(0, 3).map((qn) => (
                  <div
                    key={qn.id}
                    className="p-2.5 rounded-lg border border-border/80 bg-secondary/30 text-xs leading-relaxed text-foreground"
                  >
                    {qn.content}
                  </div>
                ))}
                {quickNotes.length > 3 && (
                  <Button asChild variant="link" size="sm" className="w-full text-xs p-0 text-primary">
                    <Link to="/quick-notes">Lihat Semua Catatan Singkat ({quickNotes.length})</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Sinkronisasi Pengingat */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pengingat Kalender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">Total Pengingat Terjadwal:</span>
                <span className="font-bold text-foreground">{reminders.length}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/reminders">Buka Menu Pengingat & Kalender</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

