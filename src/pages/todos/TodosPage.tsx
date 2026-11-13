import React, { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ListTodo, Plus, Trash2, Edit2, Flame, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { TodoItem, TodoCategory, Priority } from '@/types/database';
import { getPriorityColor } from '@/lib/utils';
import { format } from 'date-fns';

export const TodosPage: React.FC = () => {
  const { todos, isLoading, createTodo, toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TodoCategory>('belajar');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('sedang');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Today's focus items (due today or no date and not completed)
  const todaysFocus = todos.filter(
    (t) => !t.is_completed && (t.due_date === todayStr || (!t.due_date && t.priority === 'tinggi'))
  );

  // Filtered list
  const filteredTodos = todos.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (completionFilter === 'pending' && item.is_completed) return false;
    if (completionFilter === 'completed' && !item.is_completed) return false;
    return true;
  });

  // Daily progress
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.is_completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleOpenCreate = () => {
    setEditingTodo(null);
    setTitle('');
    setCategory('belajar');
    setDueDate(todayStr);
    setPriority('sedang');
    setModalOpen(true);
  };

  const handleOpenEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setCategory(todo.category);
    setDueDate(todo.due_date || '');
    setPriority(todo.priority);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTodo) {
      updateTodo.mutate(
        {
          id: editingTodo.id,
          title,
          category,
          due_date: dueDate || null,
          priority,
        },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createTodo.mutate(
        {
          title,
          category,
          due_date: dueDate || null,
          priority,
        },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  const getCategoryLabel = (cat: TodoCategory) => {
    switch (cat) {
      case 'belajar':
        return 'Belajar';
      case 'kuliah':
        return 'Kuliah';
      case 'pribadi':
        return 'Pribadi';
      case 'lainnya':
      default:
        return 'Lainnya';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Daftar To-Do List
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Checklist aktivitas harian, target belajar, dan fokus utama hari ini.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Kegiatan</span>
        </Button>
      </div>

      {/* Daily Progress & Today's Focus Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Progress */}
        <Card className="border-border/80 p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Progress Penyelesaian</span>
            <div className="flex items-baseline justify-between mt-1 mb-3">
              <span className="text-2xl font-bold text-foreground">{progressPercent}%</span>
              <span className="text-xs text-muted-foreground">
                {completedCount} dari {totalCount} selesai
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/80">
            {progressPercent === 100
              ? 'Luar biasa! Semua kegiatan telah diselesaikan hari ini.'
              : `${totalCount - completedCount} kegiatan masih menunggu untuk diselesaikan.`}
          </p>
        </Card>

        {/* Today's Focus (2 Cols) */}
        <Card className="md:col-span-2 border-border/80 p-5 bg-gradient-to-r from-card to-secondary/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Today&apos;s Focus
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Prioritas utama yang harus diselesaikan pada hari ini
              </p>
            </div>
          </div>

          {todaysFocus.length === 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/80 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Tidak ada fokus khusus hari ini. Anda bebas menyelesaikan kegiatan lainnya.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysFocus.slice(0, 3).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/80 shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() =>
                        toggleTodo.mutate({
                          id: todo.id,
                          is_completed: todo.is_completed,
                        })
                      }
                    />
                    <span className="font-semibold text-foreground truncate">{todo.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {getCategoryLabel(todo.category)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Category Tabs & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'belajar', label: 'Belajar' },
            { id: 'kuliah', label: 'Kuliah' },
            { id: 'pribadi', label: 'Pribadi' },
            { id: 'lainnya', label: 'Lainnya' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Completion status selector */}
        <div className="w-36">
          <Select
            value={completionFilter}
            onValueChange={(val: 'all' | 'pending' | 'completed') => setCompletionFilter(val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Belum Selesai</SelectItem>
              <SelectItem value="completed">Sudah Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* To-Do Items List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat kegiatan...</div>
      ) : filteredTodos.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={CheckCircle}
              title="Tidak Ada Kegiatan"
              description="Tidak ada to-do list yang sesuai dengan kategori dan filter ini."
              actionLabel="+ Tambah Kegiatan Baru"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => {
            const pColor = getPriorityColor(todo.priority);
            return (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card transition-all ${
                  todo.is_completed ? 'opacity-60 bg-card/60' : 'hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={() =>
                      toggleTodo.mutate({
                        id: todo.id,
                        is_completed: todo.is_completed,
                      })
                    }
                  />

                  <div className="truncate">
                    <p
                      className={`text-sm font-semibold text-foreground truncate ${
                        todo.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {getCategoryLabel(todo.category)}
                      </span>
                      {todo.due_date && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          • <Calendar className="h-3 w-3" /> {todo.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    className={`text-[10px] px-2 py-0.5 border ${pColor.bg} ${pColor.text} ${pColor.border}`}
                  >
                    {pColor.label}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(todo)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Ubah kegiatan"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(todo.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Hapus kegiatan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTodo ? 'Ubah Kegiatan To-Do' : 'Tambah Kegiatan Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Kegiatan
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Membaca Bab 4 Buku Basis Data"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Kategori
                  </label>
                  <Select
                    value={category}
                    onValueChange={(val: TodoCategory) => setCategory(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="belajar">Belajar</SelectItem>
                      <SelectItem value="kuliah">Kuliah</SelectItem>
                      <SelectItem value="pribadi">Pribadi</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tanggal Kegiatan (Opsional)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createTodo.isPending || updateTodo.isPending}
              >
                {editingTodo ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Kegiatan?"
        description="Kegiatan to-do ini akan dihapus dari daftar secara permanen."
        isLoading={deleteTodo.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteTodo.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};
