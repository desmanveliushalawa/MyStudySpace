import React, { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { BookMarked, Plus, Edit2, Trash2, Palette } from 'lucide-react';
import { Subject } from '@/types/database';

const COLOR_PRESETS = [
  { name: 'Sage Green', value: '#5B7057' },
  { name: 'Soft Olive', value: '#7A8B6E' },
  { name: 'Warm Terracotta', value: '#A66E58' },
  { name: 'Dusty Slate', value: '#64748B' },
  { name: 'Ocean Indigo', value: '#475569' },
  { name: 'Muted Amber', value: '#B45309' },
  { name: 'Rose Clay', value: '#9F5B68' },
  { name: 'Teal Forest', value: '#2D6A4F' },
];

export const SubjectsPage: React.FC = () => {
  const { subjects, isLoading, createSubject, updateSubject, deleteSubject } = useSubjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#5B7057');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setColor('#5B7057');
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setColor(sub.color);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      updateSubject.mutate(
        { id: editingSubject.id, name, code, color },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createSubject.mutate(
        { name, code, color },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            Pengelolaan Mata Kuliah
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Daftar mata kuliah perkuliahan sebagai acuan pengelompokan materi catatan, tugas, dan jadwal belajar.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Mata Kuliah</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat mata kuliah...</div>
      ) : subjects.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="p-8">
            <EmptyState
              icon={BookMarked}
              title="Belum Ada Mata Kuliah"
              description="Tambahkan mata kuliah perkuliahan Anda untuk mulai mengorganisir tugas dan materi."
              actionLabel="+ Tambah Mata Kuliah Pertama"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <Card key={sub.id} className="floating-card border-border/80">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: sub.color }}
                  />
                  <div>
                    <CardTitle className="text-base font-semibold">{sub.name}</CardTitle>
                    {sub.code && (
                      <CardDescription className="text-xs font-mono font-medium">
                        {sub.code}
                      </CardDescription>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(sub)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Ubah Mata Kuliah"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(sub.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Hapus Mata Kuliah"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal Tambah / Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Perbarui Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Mata Kuliah
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Algoritma dan Struktur Data"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Kode Mata Kuliah (Opsional)
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: IF2110"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  Warna Indikator
                </label>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {COLOR_PRESETS.map((cp) => (
                    <button
                      key={cp.value}
                      type="button"
                      onClick={() => setColor(cp.value)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                        color === cp.value
                          ? 'border-primary ring-2 ring-primary/20 font-bold bg-secondary/50'
                          : 'border-border hover:bg-secondary/30'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cp.value }}
                      />
                      <span className="truncate">{cp.name}</span>
                    </button>
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
                disabled={createSubject.isPending || updateSubject.isPending}
              >
                {editingSubject ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Hapus */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Mata Kuliah?"
        description="Mata kuliah ini akan dihapus. Tugas dan catatan yang terhubung dengannya tidak akan terhapus, tetapi relasinya akan menjadi tanpa mata kuliah (Umum)."
        isLoading={deleteSubject.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteSubject.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
};

