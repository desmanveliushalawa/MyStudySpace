import React, { useState } from 'react';
import { useQuickNotes } from '@/hooks/useQuickNotes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { StickyNote, Plus, Trash2, Edit2, Palette } from 'lucide-react';
import { QuickNote } from '@/types/database';
import { formatDateID } from '@/lib/utils';

const NOTE_COLORS = [
  { name: 'Krem Alami', bg: '#FAF8F5', border: '#EFECE6' },
  { name: 'Sage Lembut', bg: '#F2F6F1', border: '#E1EBE0' },
  { name: 'Almond Hangat', bg: '#F8F3ED', border: '#ECE2D8' },
  { name: 'Langit Tenang', bg: '#F1F5F9', border: '#E2E8F0' },
  { name: 'Lavender Redup', bg: '#F5F2F8', border: '#E9E2EF' },
];

export const QuickNotesPage: React.FC = () => {
  const { quickNotes, isLoading, createQuickNote, updateQuickNote, deleteQuickNote } = useQuickNotes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FAF8F5');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setContent('');
    setColor('#FAF8F5');
    setModalOpen(true);
  };

  const handleOpenEdit = (note: QuickNote) => {
    setEditingNote(note);
    setContent(note.content);
    setColor(note.color);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingNote) {
      updateQuickNote.mutate(
        { id: editingNote.id, content, color },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createQuickNote.mutate(
        { content, color },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-primary" />
            Catatan Singkat (Quick Notes)
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Abadikan ide kilat, memo kuliah, atau daftar tugas sementara dengan cepat dan fleksibel.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Buat Catatan Singkat</span>
        </Button>
      </div>

      {/* Grid of Notes */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat catatan singkat...</div>
      ) : quickNotes.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={StickyNote}
              title="Belum Ada Catatan Singkat"
              description="Catatan singkat cocok untuk menampung ide kilat atau hal penting yang ingin dicatat cepat."
              actionLabel="+ Tambah Catatan Singkat"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickNotes.map((note) => (
            <div
              key={note.id}
              className="group relative flex flex-col justify-between rounded-xl p-4 border shadow-xs hover:shadow-floating transition-all duration-200"
              style={{
                backgroundColor: note.color,
                borderColor: '#E2E8F0',
                color: '#1E293B',
              }}
            >
              <p className="text-xs font-normal whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 text-[10px] text-slate-500">
                <span>{formatDateID(note.created_at, 'dd MMM yyyy')}</span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(note)}
                    className="p-1 rounded hover:bg-black/5 text-slate-600"
                    title="Ubah"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="p-1 rounded hover:bg-black/5 text-rose-600"
                    title="Hapus"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Perbarui Catatan Singkat' : 'Catatan Singkat Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Isi Catatan Kilat
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ketik ide atau poin penting di sini..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  Warna Kertas
                </label>
                <div className="flex gap-2 pt-1">
                  {NOTE_COLORS.map((nc) => (
                    <button
                      key={nc.bg}
                      type="button"
                      onClick={() => setColor(nc.bg)}
                      className={`h-7 w-7 rounded-full border transition-all ${
                        color === nc.bg
                          ? 'ring-2 ring-primary ring-offset-2 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: nc.bg, borderColor: nc.border }}
                      title={nc.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createQuickNote.isPending || updateQuickNote.isPending}
              >
                {editingNote ? 'Simpan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Catatan Singkat?"
        description="Catatan singkat ini akan dihapus dari dashboard Anda."
        isLoading={deleteQuickNote.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteQuickNote.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};

