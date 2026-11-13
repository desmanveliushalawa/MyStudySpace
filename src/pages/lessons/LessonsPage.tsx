import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { useSubjects } from '@/hooks/useSubjects';
import { TiptapEditor } from '@/components/lessons/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDashed,
} from 'lucide-react';
import { format, parseISO, startOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { NoteStatus } from '@/types/database';
import { formatDateID } from '@/lib/utils';

export const LessonsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth()); // 0 - 11
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const { notes, saveNote, deleteNote, isLoading } = useStudyNotes(selectedDateStr);
  const { subjects } = useSubjects();

  // Daftar nama bulan (Januari - Desember)
  const months = useMemo(() => {
    const yearDate = startOfYear(new Date(selectedYear, 0, 1));
    return eachMonthOfInterval({
      start: yearDate,
      end: new Date(selectedYear, 11, 31),
    }).map((d, index) => ({
      index,
      name: format(d, 'MMMM', { locale: id }),
      monthNumber: index + 1,
    }));
  }, [selectedYear]);

  // Hitung pembagian minggu (Senin - Minggu) untuk bulan yang dipilih
  const weeks = useMemo(() => {
    const mStart = startOfMonth(new Date(selectedYear, selectedMonthIndex, 1));
    const mEnd = endOfMonth(mStart);
    const allDaysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });

    // Kelompokkan hari per minggu (Minggu 1 s.d. Minggu 5)
    const resultWeeks: { weekNumber: number; days: { date: Date; dateStr: string; dayName: string; dayIndex: number }[] }[] = [];
    let currentWeekDays: { date: Date; dateStr: string; dayName: string; dayIndex: number }[] = [];
    let weekCounter = 1;

    allDaysInMonth.forEach((day) => {
      // getDay: 0 is Sunday, 1 is Monday... 6 is Saturday
      // Format ke Senin=1, Minggu=7
      const rawDay = getDay(day);
      const isoDay = rawDay === 0 ? 7 : rawDay;

      currentWeekDays.push({
        date: day,
        dateStr: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEEE', { locale: id }),
        dayIndex: isoDay,
      });

      // Jika hari Minggu (isoDay 7) atau hari terakhir bulan, tutup minggu ini
      if (isoDay === 7 || isSameDay(day, mEnd)) {
        resultWeeks.push({
          weekNumber: weekCounter++,
          days: [...currentWeekDays],
        });
        currentWeekDays = [];
      }
    });

    return resultWeeks;
  }, [selectedYear, selectedMonthIndex]);

  // Update selected week when date changes
  useEffect(() => {
    const targetDate = parseISO(selectedDateStr);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    if (targetYear === selectedYear && targetMonth === selectedMonthIndex) {
      const foundWeekIdx = weeks.findIndex((w) =>
        w.days.some((d) => d.dateStr === selectedDateStr)
      );
      if (foundWeekIdx !== -1) {
        setSelectedWeekIndex(foundWeekIdx);
      }
    }
  }, [selectedDateStr, selectedYear, selectedMonthIndex, weeks]);

  // Set active note saat catatan berubah
  useEffect(() => {
    if (notes.length > 0) {
      if (!activeNoteId || !notes.some((n) => n.id === activeNoteId)) {
        setActiveNoteId(notes[0].id);
      }
    } else {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCreateNewNoteForDay = () => {
    saveNote.mutate(
      {
        note_date: selectedDateStr,
        title: 'Materi Pembelajaran Baru',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
        status: 'belum_dipelajari',
      },
      {
        onSuccess: (newNote) => {
          setActiveNoteId(newNote.id);
        },
      }
    );
  };

  const getStatusIcon = (st: NoteStatus) => {
    switch (st) {
      case 'selesai':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'sedang_dipelajari':
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const currentWeek = weeks[selectedWeekIndex] || weeks[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Year Selector & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Menu Pelajaran
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Navigasi catatan belajar terstruktur berdasarkan tanggal kalender nyata (Tahun &gt; Bulan &gt; Minggu &gt; Hari).
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Tahun:</span>
          <Select
            value={String(selectedYear)}
            onValueChange={(val) => setSelectedYear(Number(val))}
          >
            <SelectTrigger className="w-28 h-9 text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Level 1: Month Tabs (Januari - Desember) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {months.map((m) => {
          const isSelected = m.index === selectedMonthIndex;
          return (
            <button
              key={m.index}
              onClick={() => {
                setSelectedMonthIndex(m.index);
                setSelectedWeekIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/70'
              }`}
            >
              {m.name} ({m.monthNumber})
            </button>
          );
        })}
      </div>

      {/* Level 2: Week Selector (Minggu 1 s.d. Minggu 4/5) */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-elevation">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Pilih Minggu:</span>
          <div className="flex gap-1.5">
            {weeks.map((w, idx) => (
              <Button
                key={w.weekNumber}
                size="sm"
                variant={selectedWeekIndex === idx ? 'default' : 'outline'}
                onClick={() => setSelectedWeekIndex(idx)}
                className="h-8 text-xs px-3"
              >
                Minggu {w.weekNumber}
              </Button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <span>Minggu {currentWeek?.weekNumber} dari {weeks.length}</span>
        </div>
      </div>

      {/* Level 3: Day Selector Cards (Hari 1-7 dengan tanggal riil) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {currentWeek?.days.map((dayObj) => {
          const isSelected = dayObj.dateStr === selectedDateStr;
          return (
            <button
              key={dayObj.dateStr}
              onClick={() => {
                setSelectedDateStr(dayObj.dateStr);
                setSearchParams({ date: dayObj.dateStr });
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border/80 bg-card hover:bg-secondary/60 text-foreground'
              }`}
            >
              <span className="text-[11px] font-semibold text-muted-foreground">
                Hari {dayObj.dayIndex} ({dayObj.dayName.slice(0, 3)})
              </span>
              <span className="text-lg font-bold mt-0.5">{format(dayObj.date, 'dd')}</span>
              <span className="text-[10px] text-muted-foreground">{format(dayObj.date, 'MMM')}</span>
            </button>
          );
        })}
      </div>

      {/* Level 4: Active Day Header & Note List + Tiptap Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Daftar Catatan di Hari Ini */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Catatan Hari Ini
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatDateID(selectedDateStr, 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCreateNewNoteForDay}
              disabled={saveNote.isPending}
              className="h-8 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Catatan</span>
            </Button>
          </div>

          {/* Notes list */}
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Memuat catatan...</div>
          ) : notes.length === 0 ? (
            <Card className="border-border/80">
              <CardContent className="p-6">
                <EmptyState
                  icon={BookOpen}
                  title="Belum Ada Catatan"
                  description="Belum ada materi pelajaran yang dicatat pada hari ini."
                  actionLabel="+ Buat Catatan Pertama"
                  onAction={handleCreateNewNoteForDay}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/80 bg-card hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {note.title}
                      </h4>
                      {getStatusIcon(note.status)}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {note.subject ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${note.subject.color}20`,
                            color: note.subject.color,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: note.subject.color }} />
                          {note.subject.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Umum</span>
                      )}

                      <span className="text-[10px] text-muted-foreground capitalize">
                        {note.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Rich Text Editor Surface */}
        <div className="lg:col-span-2">
          {activeNote ? (
            <TiptapEditor
              key={activeNote.id}
              initialTitle={activeNote.title}
              initialContent={activeNote.content}
              initialStatus={activeNote.status}
              initialSubjectId={activeNote.subject_id}
              initialLinks={activeNote.reference_links}
              subjects={subjects}
              isSaving={saveNote.isPending}
              onSave={(payload) => {
                saveNote.mutate({
                  id: activeNote.id,
                  note_date: activeNote.note_date,
                  ...payload,
                });
              }}
              onDelete={() => setDeleteNoteId(activeNote.id)}
            />
          ) : (
            <div className="flex h-full min-h-[350px] items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
              <div className="space-y-3">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Pilih catatan di sebelah kiri atau klik tombol &quot;Tambah Catatan&quot; untuk mulai menulis.
                </p>
                <Button size="sm" onClick={handleCreateNewNoteForDay}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Buat Catatan Baru
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteNoteId)}
        onOpenChange={(open) => !open && setDeleteNoteId(null)}
        title="Hapus Catatan Pelajaran?"
        description="Catatan ini akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan."
        isLoading={deleteNote.isPending}
        onConfirm={() => {
          if (deleteNoteId) {
            deleteNote.mutate(deleteNoteId, {
              onSuccess: () => setDeleteNoteId(null),
            });
          }
        }}
      />
    </div>
  );
};
