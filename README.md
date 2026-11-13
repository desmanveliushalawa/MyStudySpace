# MyStudySpace — Personal Study Dashboard

Aplikasi catatan dan manajemen belajar pribadi modern, minimalis, dan elegan yang dibangun dengan arsitektur multi-user, keamanan isolasi data Row Level Security (RLS) PostgreSQL, dan integrasi Google Calendar API resmi.

---

## 📋 Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Arsitektur & Tech Stack](#arsitektur--tech-stack)


---

## 🌟 Fitur Utama

- **Dashboard Utama**: Ringkasan waktu belajar, sapaan dinamis waktu, mini kalender jadwal, progress materi belajar, deadline terdekat, dan quick activity log.
- **Modul Pelajaran Terstruktur**: Navigasi hirarkis berdasarkan tanggal kalender riil (Tahun > Bulan > Minggu 1-5 > Hari 1-7 Senin-Minggu).
- **Rich Text Study Editor**: Editor catatan berbasis Tiptap dengan dukungan Heading, Formatting, Checklist, Reference Links, serta status belajar (*Belum Dipelajari*, *Sedang Dipelajari*, *Selesai*).
- **Manajemen Tugas & Mata Kuliah**: Pelacakan tugas kuliah dengan skala prioritas, indikator warna lembut, filter status, dan sorting deadline.
- **To-Do List & Today's Focus**: Pengelolaan checklist kegiatan harian dan fokus hari ini dengan kategori jelas.
- **Proyek Belajar**: Pembagian tugas proyek terstruktur dengan progress otomatis berbasis sub-tasks.
- **Integrasi Google Calendar (OAuth 2.0)**: Sinkronisasi satu arah pengingat dan deadline langsung ke Google Calendar pengguna dengan zona waktu `Asia/Jakarta`.
- **Desain Ramah Mata & Bebas AI Slop**: Desain bertema *Sage Green* dan *Cream* (Light Mode) serta *Dark Navy* & *Muted Green* (Dark Mode) dengan prinsip aksesibilitas WCAG AA dan sentuhan spasial halus (*Antigravity Design*).

---

## 🛠️ Arsitektur & Tech Stack

- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- **State & Data Fetching**: TanStack Query (React Query), React Hook Form + Zod.
- **Editor**: Tiptap Editor.
- **Grafik & Ikon**: Recharts, Lucide Icons.
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage, Edge Functions).
- **Hosting / Deploy**: Cloudflare Pages.

---


