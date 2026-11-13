import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteStatus, ReferenceLink, Subject } from '@/types/database';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  initialTitle: string;
  initialContent: Record<string, unknown> | string;
  initialStatus: NoteStatus;
  initialSubjectId?: string | null;
  initialLinks?: ReferenceLink[];
  subjects: Subject[];
  isSaving: boolean;
  onSave: (payload: {
    title: string;
    content: Record<string, unknown>;
    status: NoteStatus;
    subject_id: string | null;
    reference_links: ReferenceLink[];
  }) => void;
  onDelete?: () => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialTitle,
  initialContent,
  initialStatus,
  initialSubjectId,
  initialLinks = [],
  subjects,
  isSaving,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<NoteStatus>(initialStatus);
  const [subjectId, setSubjectId] = useState<string | null>(initialSubjectId || null);
  const [links, setLinks] = useState<ReferenceLink[]>(initialLinks);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Parse JSON content if string
  const parsedContent = React.useMemo(() => {
    if (typeof initialContent === 'string') {
      try {
        return JSON.parse(initialContent);
      } catch {
        return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: initialContent }] }] };
      }
    }
    return initialContent || { type: 'doc', content: [] };
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Mulai tulis materi belajar Anda di sini...',
      }),
    ],
    content: parsedContent,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-foreground text-sm leading-relaxed p-4',
      },
    },
  });

  // Sinkronisasi data saat initial data berganti
  useEffect(() => {
    setTitle(initialTitle);
    setStatus(initialStatus);
    setSubjectId(initialSubjectId || null);
    setLinks(initialLinks);
    if (editor && initialContent) {
      editor.commands.setContent(parsedContent);
    }
  }, [initialTitle, initialContent, initialStatus, initialSubjectId, initialLinks, editor, parsedContent]);

  // Debounced auto-save trigger
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const triggerSave = (newStatus?: NoteStatus) => {
    if (!editor) return;
    setSaveStatus('saving');
    const contentJson = editor.getJSON();

    onSave({
      title: title || 'Catatan Baru',
      content: contentJson,
      status: newStatus || status,
      subject_id: subjectId,
      reference_links: links,
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 400);
  };

  const handleEditorChange = () => {
    setSaveStatus('saving');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      triggerSave();
    }, 1500);
  };

  useEffect(() => {
    if (!editor) return;
    editor.on('update', handleEditorChange);
    return () => {
      editor.off('update', handleEditorChange);
    };
  }, [editor, title, status, subjectId, links]);

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const item: ReferenceLink = {
      title: newLinkTitle.trim() || newLinkUrl.trim(),
      url: newLinkUrl.startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
    };
    const updated = [...links, item];
    setLinks(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const handleRemoveLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Editor Top Bar: Title, Subject, Status, Save State */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/80 bg-secondary/30">
        <div className="flex-1 min-w-[240px]">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus('saving');
              if (debounceTimer.current) clearTimeout(debounceTimer.current);
              debounceTimer.current = setTimeout(triggerSave, 1500);
            }}
            placeholder="Judul Catatan Materi..."
            className="text-base md:text-lg font-bold border-0 bg-transparent px-1 focus-visible:ring-0 shadow-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Save Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            {isSaving || saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Menyimpan...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Tersimpan</span>
              </>
            ) : (
              <span>Otomatis simpan aktif</span>
            )}
          </div>

          {/* Subject Dropdown */}
          <div className="w-40">
            <Select
              value={subjectId || 'none'}
              onValueChange={(val) => {
                const newSub = val === 'none' ? null : val;
                setSubjectId(newSub);
                setTimeout(() => triggerSave(), 100);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih Matkul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Mata Kuliah</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="truncate">{sub.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div className="w-44">
            <Select
              value={status}
              onValueChange={(val: NoteStatus) => {
                setStatus(val);
                triggerSave(val);
              }}
            >
              <SelectTrigger className="h-8 text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="belum_dipelajari">Belum Dipelajari</SelectItem>
                <SelectItem value="sedang_dipelajari">Sedang Dipelajari</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manual Save Button */}
          <Button
            size="sm"
            onClick={() => triggerSave()}
            disabled={isSaving}
            className="h-8 px-3 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan</span>
          </Button>

          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Hapus Catatan"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/80 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-secondary font-bold text-primary')}
          title="Tebal (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-secondary font-bold text-primary')}
          title="Miring (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-secondary font-bold text-primary')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-secondary font-bold text-primary')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-secondary font-bold text-primary')}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-secondary font-bold text-primary')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-secondary font-bold text-primary')}
          title="Numbering List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('taskList') && 'bg-secondary font-bold text-primary')}
          title="Checklist Tugas"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddLink(!showAddLink)}
          className={cn('h-8 px-2 gap-1 text-xs', links.length > 0 && 'text-primary font-medium')}
          title="Tambah Link Referensi"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Referensi ({links.length})</span>
        </Button>
      </div>

      {/* Reference Links Section */}
      {(showAddLink || links.length > 0) && (
        <div className="p-3 bg-secondary/20 border-b border-border/80 space-y-2">
          {showAddLink && (
            <div className="flex flex-wrap items-center gap-2 p-2 bg-card rounded-lg border border-border">
              <Input
                placeholder="Judul Referensi (misal: Slide Pertemuan 3)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="h-8 text-xs flex-1 min-w-[180px]"
              />
              <Input
                placeholder="https://drive.google.com/..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="h-8 text-xs flex-1 min-w-[200px]"
              />
              <Button size="sm" onClick={handleAddLink} className="h-8 text-xs px-3">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Tambah
              </Button>
            </div>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs border border-border"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>{link.title}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => handleRemoveLink(idx)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                    title="Hapus referensi"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Content Surface */}
      <EditorContent editor={editor} />
    </div>
  );
};

