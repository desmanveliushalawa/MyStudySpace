import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Priority, ProjectTask } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sapaan waktu dalam Bahasa Indonesia
export function getTimeGreeting(): string {
  const currentHour = new Date().getHours();
  if (currentHour >= 4 && currentHour < 11) {
    return 'Selamat Pagi';
  } else if (currentHour >= 11 && currentHour < 15) {
    return 'Selamat Siang';
  } else if (currentHour >= 15 && currentHour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}

// Format tanggal standar Bahasa Indonesia
export function formatDateID(dateInput: string | Date, formatStr: string = 'EEEE, dd MMMM yyyy'): string {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(date, formatStr, { locale: id });
  } catch {
    return String(dateInput);
  }
}

// Format tanggal relatif (contoh: 2 jam yang lalu)
export function formatRelativeTimeID(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  } catch {
    return '';
  }
}

// Indikator visual lembut untuk prioritas (sesuai ketentuan desain)
export function getPriorityColor(priority: Priority): { bg: string; text: string; border: string; label: string } {
  switch (priority) {
    case 'tinggi':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-900/60',
        label: 'Tinggi',
      };
    case 'sedang':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-900/60',
        label: 'Sedang',
      };
    case 'rendah':
    default:
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-900/60',
        label: 'Rendah',
      };
  }
}

// Hitung persentase progress tugas proyek
export function calculateProgress(tasks: ProjectTask[] = []): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.is_completed).length;
  return Math.round((completed / tasks.length) * 100);
}

