# MyStudySpace — Personal Study Dashboard

Aplikasi catatan dan manajemen belajar pribadi modern, minimalis, dan elegan yang dibangun dengan arsitektur multi-user, keamanan isolasi data Row Level Security (RLS) PostgreSQL, dan integrasi Google Calendar API resmi.

---

## 📋 Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Arsitektur & Tech Stack](#arsitektur--tech-stack)
3. [Panduan Setup Supabase](#panduan-setup-supabase)
4. [Panduan Autentikasi & Keamanan Akun](#panduan-autentikasi--keamanan-akun)
5. [Panduan Setup Google Cloud Console (Calendar API)](#panduan-setup-google-cloud-console-calendar-api)
6. [Struktur Database](#struktur-database)
7. [Environment Variables](#environment-variables)
8. [Panduan Deployment (Cloudflare Pages)](#panduan-deployment-cloudflare-pages)
9. [Catatan Pemeliharaan & Free Tier](#catatan-pemeliharaan--free-tier)

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

## 🗄️ Panduan Setup Supabase

### 1. Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik **New Project**, tentukan nama proyek (misal: `MyStudySpace`), password database yang kuat, dan pilih region terdekat (misal: `Singapore`).

### 2. Eksekusi Migration SQL
Buka menu **SQL Editor** pada Supabase Dashboard, lalu salin dan jalankan seluruh isi file migration berikut:
```
supabase/migrations/20241113000000_initial_schema.sql
```
Migration ini secara otomatis akan menyiapkan:
- 12 tabel data dengan tipe data dan constraints lengkap.
- Fungsi dan trigger otomatis `updated_at`.
- Trigger pendaftaran akun (`handle_new_user`) yang otomatis membuat baris profil dan 3 proyek awal nyata.
- Trigger validasi integritas anti referensi lintas-pengguna (*Anti-Cross-User FK*).
- Row Level Security (RLS) aktif dengan kebijakan terpisah (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- Konfigurasi bucket Supabase Storage `avatars` dengan batas ukuran 2MB dan RLS per-user.
- Index performa untuk query berbasis `user_id`, tanggal, dan status.

---

## 🔐 Panduan Autentikasi & Keamanan Akun

Aplikasi ini ditujukan untuk kepemilikan pribadi oleh Anda (**Desman Halawa**), tetapi dibangun dengan standar isolasi data multi-user yang ketat.

### 1. Pendaftaran Akun Pemilik Pertama Kali
1. Jalankan aplikasi atau buka halaman `/register`.
2. Daftarkan akun menggunakan salah satu email pribadi Anda:
   - `desmanhalawa2020@gmail.com`
   - `desman.123450114@student.itera.ac.id`
3. Masukkan password Anda. Sistem Supabase Auth akan memproses pendaftaran dan trigger database akan membuat profil serta 3 proyek awal default.

### 2. Menonaktifkan Registrasi Publik (Wajib untuk Akun Pribadi)
Setelah akun Anda berhasil dibuat, matikan fitur pendaftaran publik agar tidak ada pihak luar yang dapat mendaftar:
1. Di Dashboard Supabase, buka **Authentication** -> **Providers** -> **Email**.
2. Matikan toggle **Enable Signups** (atau centang opsi *Disable signups*).
3. Klik **Save**.
> *Catatan*: Akun Anda yang sudah terdaftar tetap dapat login normal, namun pendaftaran publik baru akan ditolak oleh sistem.

### 3. Konfigurasi Site URL & Redirect URLs
Agar fitur konfirmasi email, reset password, dan recovery berfungsi dengan benar:
1. Buka **Authentication** -> **URL Configuration**.
2. **Site URL**: Masukkan URL domain aplikasi Anda (misal: `https://mystudyspace.pages.dev` saat production, atau `http://localhost:5173` saat development).
3. **Redirect URLs**: Tambahkan:
   - `http://localhost:5173/**`
   - `https://your-domain.pages.dev/**`
   - `https://your-domain.pages.dev/reset-password`

### 4. Rekomendasi Custom SMTP
Supabase Free Tier menyediakan SMTP bawaan dengan batas sangat ketat (maksimal 3-4 email per jam) untuk reset password dan verifikasi.
- **Rekomendasi**: Hubungkan custom SMTP di **Project Settings** -> **Authentication** -> **SMTP Settings** menggunakan layanan gratis seperti Resend, Brevo, atau Mailgun agar pengiriman link reset password tidak tertahan kuota.

---

## 📅 Panduan Setup Google Cloud Console (Calendar API)

Untuk mengaktifkan sinkronisasi pengingat ke Google Calendar:

### 1. Buat Proyek di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru dengan nama `MyStudySpace`.
3. Buka **APIs & Services** -> **Library**, cari **Google Calendar API**, lalu klik **Enable**.

### 2. Konfigurasi OAuth Consent Screen
1. Buka **APIs & Services** -> **OAuth consent screen**.
2. Pilih User Type **External**, lalu klik **Create**.
3. Isi informasi aplikasi:
   - App name: `MyStudySpace`
   - User support email: `desmanhalawa2020@gmail.com`
   - Developer contact email: `desmanhalawa2020@gmail.com`
4. Pada tahapan **Scopes**, tambahkan scope:
   - `https://www.googleapis.com/auth/calendar.events`
5. Pada tahapan **Test Users**, daftarkan kedua email pribadi Anda:
   - `desmanhalawa2020@gmail.com`
   - `desman.123450114@student.itera.ac.id`

### 3. Status "Testing" vs "In Production" (Solusi Token Kedaluwarsa)
- **Penting**: Jika aplikasi berada dalam status *Testing*, Google membatasi masa berlaku refresh token menjadi **7 hari**. Artinya, setiap 7 hari Anda harus menghubungkan ulang Google Calendar.
- **Solusi untuk Penggunaan Pribadi**: Klik tombol **Publish App** untuk memindahkan status dari *Testing* ke **In production**. Karena aplikasi ini hanya Anda pakai sendiri, Anda **tidak perlu** mengajukan verifikasi ke Google. Ketika Anda pertama kali menghubungkan kalender, Google hanya akan menampilkan layar peringatan *"Google hasn't verified this app"*. Cukup klik **Advanced** -> **Go to MyStudySpace (unsafe)** dan beri izin. Refresh token Anda akan bertahan permanen dan tidak kedaluwarsa tiap 7 hari!

### 4. Membuat OAuth Client ID Credentials
1. Buka **APIs & Services** -> **Credentials** -> **Create Credentials** -> **OAuth client ID**.
2. Application type: **Web application**.
3. Name: `MyStudySpace Client`.
4. Pada **Authorized redirect URIs**, masukkan URL Supabase Edge Function OAuth callback:
   - `https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/google-calendar-auth/callback`
5. Salin **Client ID** dan **Client Secret** untuk disimpan di secrets Edge Functions Supabase.

---

## 🏛️ Struktur Database

Database terdiri dari 12 tabel terisolasi dengan Row Level Security:

| Tabel | Fungsi & Deskripsi |
|---|---|
| `profiles` | Profil pengguna, nama lengkap, URL avatar, preferensi tema (*light* / *dark* / *system*). |
| `subjects` | Daftar mata kuliah, kode matkul, dan label warna indikator (*sage green*, dll). |
| `study_notes` | Catatan harian berbasis tanggal kalender, konten Tiptap JSON, status belajar, link referensi. |
| `tasks` | Tugas perkuliahan, relasi mata kuliah, prioritas (*rendah*, *sedang*, *tinggi*), dan deadline. |
| `todo_items` | Checklist to-do harian, kategori (*belajar*, *kuliah*, *pribadi*, *lainnya*), prioritas. |
| `projects` | Proyek belajar/kuliah, deskripsi, tanggal mulai & deadline, status pengerjaan. |
| `project_tasks` | Sub-tugas di dalam proyek untuk perhitungan progress otomatis. |
| `study_sessions` | Riwayat dan jadwal sesi belajar (Pomodoro timer / jadwal belajar mini kalender). |
| `quick_notes` | Catatan cepat tempel yang dapat diakses dari dashboard. |
| `reminders` | Pengingat deadline & jadwal dengan status sinkronisasi ke Google Calendar. |
| `calendar_integrations` | Token OAuth Google Calendar (terenkripsi dan dilindungi dari pembacaan klien). |
| `activity_log` | Riwayat aktivitas dan log perubahan pengguna untuk ringkasan di dashboard. |

---

## 🔑 Environment Variables

Salin `.env.example` menjadi `.env.local` pada frontend:
```bash
cp .env.example .env.local
```

Isi variabel:
```ini
VITE_SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
VITE_SUPABASE_ANON_KEY="<YOUR_ANON_PUBLIC_KEY>"
```

Pada Supabase Edge Functions Secrets:
```bash
supabase secrets set GOOGLE_CLIENT_ID="<CLIENT_ID>"
supabase secrets set GOOGLE_CLIENT_SECRET="<CLIENT_SECRET>"
supabase secrets set GOOGLE_REDIRECT_URI="https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/google-calendar-auth/callback"
supabase secrets set ENCRYPTION_KEY="<32_CHAR_RANDOM_SECRET>"
```

---

## 🚀 Panduan Deployment (Cloudflare Pages)

Aplikasi dibangun sebagai Static Site SPA yang dapat di-deploy secara otomatis melalui Cloudflare Pages:

1. Push repository proyek ke GitHub.
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Pilih repository `Personal Study Dashboard`.
4. Masukkan konfigurasi build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Pada tab **Environment variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Klik **Save and Deploy**.
7. Konfigurasi SPA Routing: File `public/_redirects` (berisi `/* /index.html 200`) telah disediakan agar refresh pada rute dalam tidak menghasilkan error 404.

---

## 💡 Catatan Pemeliharaan & Free Tier Supabase

- **Supabase Inactivity Pause**: Proyek Supabase pada tier gratis (*Free tier*) akan otomatis dijeda (*paused*) jika tidak ada traffic database selama sekitar 1 minggu.
- **Pemulihan**: Jika aplikasi tidak bisa memuat data setelah lama tidak dibuka, cukup login ke [Supabase Dashboard](https://supabase.com/dashboard) dan klik **Restore Project**. Semua data, tabel, dan kredensial Anda tetap aman dan akan aktif kembali dalam hitungan detik.
