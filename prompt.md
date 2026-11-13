PROJECT: PERSONAL STUDY DASHBOARD
Buat sebuah website aplikasi catatan belajar pribadi bernama MyStudySpace. Website ini digunakan untuk mengatur jadwal belajar, menyimpan materi perkuliahan, mencatat tugas, mengelola to-do list, mengatur proyek, dan mengingatkan deadline.
Website harus benar-benar berfungsi (bukan sekadar tampilan UI atau prototype). Gunakan database, autentikasi akun, dan integrasi Google Calendar.
1. DESAIN DAN TAMPILAN
Buat desain website dengan konsep:
• Modern, minimalis, aesthetic, clean, dan elegan.
• Ramah mata untuk penggunaan jangka panjang.
• Responsive untuk laptop, tablet, dan smartphone.
• Gunakan font Inter atau Plus Jakarta Sans.
• Gunakan rounded corners, soft shadows, dan animasi transisi yang halus.
• Jangan terlalu ramai dengan dekorasi.
Tema warna:
• Light Mode: off-white, cream, soft beige, dan sage green.
• Dark Mode: dark navy, charcoal, dan muted green.
• Sediakan tombol Light Mode dan Dark Mode.
• Simpan preferensi tema pengguna agar tidak berubah ketika login kembali.
Layout:
• Sidebar di sebelah kiri.
• Header berisi sapaan pengguna, tanggal, dan profil.
• Dashboard utama menampilkan ringkasan aktivitas belajar.
• Sidebar dapat disembunyikan pada layar kecil.
2. SISTEM LOGIN DAN DATABASE
Buat sistem autentikasi yang benar-benar berfungsi.
Fitur:
• Register akun.
• Login menggunakan email dan password.
• Logout.
• Lupa password dan reset password.
• Proteksi halaman agar hanya pengguna yang login dapat mengakses dashboard.
• Setiap pengguna memiliki data pribadi yang terpisah.
• Data tersimpan secara permanen di database.
• Jangan menggunakan localStorage sebagai pengganti database utama.
Gunakan Supabase sebagai backend:
• Supabase Authentication untuk login dan registrasi.
• PostgreSQL untuk database.
• Row Level Security (RLS) agar pengguna hanya dapat mengakses datanya sendiri.
Email awal yang akan digunakan:
• desmanhalawa2020@gmail.com
• desman.123450114@student.itera.ac.id
Kedua email tersebut dapat digunakan untuk registrasi atau login. Jangan membuat password secara otomatis atau menanamkan password di source code.
3. DASHBOARD UTAMA
Buat dashboard yang menampilkan:
• Sapaan berdasarkan waktu, seperti Selamat Pagi, Selamat Siang, atau Selamat Malam.
• Tanggal dan hari saat ini.
• Total materi belajar.
• Total tugas yang belum selesai.
• Total tugas yang sudah selesai.
• Jumlah proyek aktif.
• Jadwal dan deadline terdekat.
• Progress belajar dalam bentuk progress bar.
• Aktivitas terbaru.
Tambahkan kalender mini pada dashboard untuk melihat jadwal belajar dan deadline.
4. MENU PELAJARAN
Buat menu bernama "Pelajaran".
Struktur navigasinya harus seperti berikut:
Pelajaran
  └── Bulan
       ├── Januari (1)
       ├── Februari (2)
       ├── Maret (3)
       ├── April (4)
       ├── Mei (5)
       ├── Juni (6)
       ├── Juli (7)
       ├── Agustus (8)
       ├── September (9)
       ├── Oktober (10)
       ├── November (11)
       └── Desember (12)
Di dalam setiap bulan terdapat:
• Minggu 1
• Minggu 2
• Minggu 3
• Minggu 4
Di dalam setiap minggu terdapat:
• Hari 1
• Hari 2
• Hari 3
• Hari 4
• Hari 5
• Hari 6
• Hari 7
Setiap hari memiliki halaman catatan belajar sendiri.
Fitur catatan belajar:
• Judul materi.
• Isi catatan dengan rich text editor.
• Bisa menambahkan heading, bold, italic, bullet list, dan numbering.
• Bisa menambahkan checklist.
• Bisa menyimpan link referensi.
• Bisa mengedit dan menghapus catatan.
• Simpan otomatis atau sediakan tombol simpan.
• Tandai materi sebagai selesai dipelajari.
• Tambahkan status Belum Dipelajari, Sedang Dipelajari, dan Selesai.
Pastikan struktur bulan, minggu, dan hari dapat dinavigasikan dengan mudah.
5. MENU TUGAS
Buat menu khusus untuk mengelola tugas perkuliahan.
Fitur:
• Tambah tugas.
• Edit tugas.
• Hapus tugas.
• Nama tugas.
• Deskripsi tugas.
• Mata kuliah.
• Tanggal mulai.
• Deadline.
• Prioritas: Rendah, Sedang, Tinggi.
• Status: Belum Dikerjakan, Sedang Dikerjakan, Selesai.
• Tandai tugas selesai.
• Filter berdasarkan status dan prioritas.
• Urutkan berdasarkan deadline terdekat.
Gunakan indikator warna yang lembut untuk membedakan prioritas tugas.
6. MENU TO-DO LIST
Buat halaman To-Do List sederhana tetapi fungsional.
Fitur:
• Tambah kegiatan.
• Checkbox untuk menyelesaikan kegiatan.
• Edit dan hapus kegiatan.
• Kategori kegiatan: Belajar, Kuliah, Pribadi, dan Lainnya.
• Tanggal kegiatan.
• Prioritas kegiatan.
• Filter kegiatan yang belum selesai dan sudah selesai.
• Progress penyelesaian harian.
Tambahkan tampilan "Today's Focus" untuk menampilkan kegiatan yang harus dikerjakan hari ini.
7. MENU PENGINGAT DAN GOOGLE CALENDAR
Buat sistem pengingat yang terintegrasi dengan Google Calendar.
Fitur:
• Tambah pengingat.
• Judul pengingat.
• Deskripsi.
• Tanggal.
• Jam.
• Pilihan notifikasi.
• Kategori pengingat.
• Deadline tugas dapat dijadikan pengingat.
• Tampilkan daftar pengingat mendatang.
Integrasikan Google Calendar menggunakan Google OAuth 2.0 dan Google Calendar API.
Ketika pengguna membuat pengingat:
1.  Simpan data pengingat ke database.
2.  Sinkronkan pengingat ke Google Calendar setelah pengguna memberikan izin.
3.  Simpan Google Calendar Event ID di database.
4.  Jika pengingat diedit, perbarui event Google Calendar.
5.  Jika pengingat dihapus, hapus event terkait dari Google Calendar.
6.  Tangani token OAuth dengan aman menggunakan backend.
Gunakan zona waktu Asia/Jakarta.
Jika Google Calendar belum terhubung, tampilkan tombol "Hubungkan Google Calendar".
Jangan hanya membuat tombol visual. Integrasi harus benar-benar berjalan menggunakan API resmi.
8. MENU PROYEK
Buat menu Proyek.
Secara default tampilkan:
• Proyek 1
• Proyek 2
• Proyek 3
Tambahkan tombol "+ Tambah Proyek".
Fitur setiap proyek:
• Nama proyek.
• Deskripsi proyek.
• Tanggal mulai.
• Deadline.
• Status proyek.
• Progress proyek.
• Daftar tugas di dalam proyek.
• Catatan proyek.
• Prioritas proyek.
• Edit dan hapus proyek.
Status proyek:
• Belum Dimulai.
• Sedang Berjalan.
• Selesai.
Setiap proyek mempunyai halaman detail sendiri.
Progress proyek dihitung berdasarkan jumlah tugas yang sudah selesai dibandingkan seluruh tugas di proyek tersebut.
9. FITUR TAMBAHAN
Tambahkan hanya beberapa fitur tambahan yang benar-benar berguna:
A. SEARCH
• Pencarian catatan.
• Pencarian tugas.
• Pencarian proyek.
B. STUDY STATISTICS
• Grafik aktivitas belajar mingguan.
• Jumlah materi yang telah diselesaikan.
• Persentase penyelesaian tugas.
• Progress proyek.
C. QUICK NOTES
• Fitur catatan singkat yang bisa diakses dari dashboard.
• Cocok untuk mencatat ide secara cepat.
D. PROFILE SETTINGS
• Ubah nama pengguna.
• Ubah foto profil.
• Ubah email melalui mekanisme autentikasi.
• Ubah password.
• Pengaturan tema.
10. STRUKTUR SIDEBAR
Susun navigasi sidebar sebagai berikut:
1.  Dashboard
2.  Pelajaran
3.  Tugas
4.  To-Do List
5.  Pengingat
6.  Proyek
7.  Catatan Singkat
8.  Statistik
9.  Pengaturan
11. STRUKTUR DATABASE SUPABASE
Buat tabel database yang diperlukan, minimal:
• profiles
• subjects
• study_notes
• tasks
• todo_items
• reminders
• projects
• project_tasks
• quick_notes
• calendar_integrations
Setiap tabel harus memiliki:
• Primary key.
• User ID sebagai pemilik data.
• Created_at.
• Updated_at jika diperlukan.
Buat foreign key dan relasi yang benar antartabel.
Aktifkan Row Level Security pada seluruh tabel yang menyimpan data pengguna.
12. KETENTUAN TEKNIS
Gunakan:
• Frontend: React + TypeScript.
• Styling: Tailwind CSS.
• UI Components: shadcn/ui.
• Backend: Supabase.
• Database: PostgreSQL.
• Authentication: Supabase Auth.
• Integrasi kalender: Google Calendar API.
• Icon: Lucide Icons.
• Grafik: Recharts.
Pastikan:
• Semua tombol berfungsi.
• Semua form dapat menyimpan data.
• Data tidak hilang ketika halaman di-refresh.
• Navigasi antarhalaman berjalan.
• Tidak ada halaman kosong.
• Tidak ada tombol dummy.
• Ada loading state.
• Ada error handling.
• Ada notifikasi sukses dan gagal.
• Tampilan responsive.
• Keamanan database diterapkan dengan benar.
13. HASIL AKHIR
Buat website yang terasa seperti aplikasi produktivitas premium, bukan template dashboard biasa.
Prioritaskan:
1.  Kenyamanan membaca dan mencatat.
2.  Navigasi pelajaran yang terstruktur.
3.  Kemudahan mengelola tugas dan proyek.
4.  Pengingat deadline yang akurat.
5.  Database yang aman dan permanen.
6.  Desain aesthetic dan ramah mata.
Mulai dengan membuat struktur database, autentikasi, dan layout utama. Setelah itu implementasikan setiap fitur secara bertahap dan pastikan seluruh fitur terhubung dengan database.
Jangan hanya menghasilkan desain. Buat aplikasi yang benar-benar dapat digunakan.
KLARIFIKASI & TAMBAHAN (prioritas lebih tinggi jika bertentangan dengan bagian di atas)
Aplikasi ini dibuat untuk pemakaian pribadi (satu pemilik), tetapi tetap dibangun dengan isolasi data per-user dan keamanan yang benar.
14. KLARIFIKASI STRUKTUR PELAJARAN
• Navigasi tetap Pelajaran > Bulan > Minggu > Hari, tetapi berbasis tanggal kalender nyata.
• Tambahkan pemilih Tahun di halaman Pelajaran (default tahun berjalan).
• Minggu dihitung dari hari Senin. Sediakan "Minggu 5" otomatis bila bulan tersebut punya tanggal yang tidak tercakup 4 minggu pertama, sehingga tanggal 29-31 tetap dapat diakses.
• "Hari 1-7" = Senin-Minggu pada minggu tersebut, dan setiap hari menampilkan tanggal aslinya.
• Satu hari boleh memiliki lebih dari satu catatan materi. Tabel study_notes menyimpan: note_date (date), subject_id (FK ke subjects, opsional), title, content, status (belum_dipelajari / sedang_dipelajari / selesai), completed_at, reference_links.
• Isi catatan disimpan sebagai JSON dari editor Tiptap (heading, bold, italic, bullet, numbering, checklist, link). Autosave dengan debounce + tombol Simpan + indikator "Tersimpan/Menyimpan...".
15. MATA KULIAH, JADWAL, DAN AKTIVITAS
• Tambahkan pengelolaan Mata Kuliah (tambah/edit/hapus, warna label) di dalam menu Pelajaran atau Pengaturan. Field "Mata kuliah" di Tugas, Catatan, dan Pengingat adalah relasi ke tabel subjects.
• Tambahkan tabel study_sessions (user_id, subject_id, title, start_at, end_at, status) untuk "jadwal belajar". Tampilkan di kalender mini dan dashboard, bisa ditambah dari menu Pengingat/Jadwal.
• Tambahkan tabel activity_log (user_id, entity_type, entity_id, action, created_at) untuk "Aktivitas terbaru". Isi melalui trigger database atau service layer.
• Semua entitas yang bisa "selesai" punya kolom completed_at agar Statistik mingguan akurat.
• Definisi progress belajar di dashboard: materi berstatus Selesai dibagi total materi.
16. AUTENTIKASI (DETAIL)
• Halaman registrasi tetap dibuat dan berfungsi agar akun pemilik bisa dibuat. Setelah akun pemilik dibuat, signup publik dinonaktifkan di pengaturan Supabase (jelaskan caranya di README). Dua email awal adalah email milik pemilik untuk dipakai mendaftar, bukan whitelist yang di-hardcode. Jangan hardcode email atau password di source code.
• Sediakan halaman /login, /register, /forgot-password, /reset-password (menangani link recovery Supabase).
• Dokumentasikan di README: pengaturan Site URL dan Redirect URLs di Supabase, serta anjuran memakai custom SMTP karena SMTP bawaan sangat terbatas.
• Trigger database membuat baris profiles otomatis saat user baru mendaftar, sekaligus membuat 3 proyek awal (Proyek 1-3) sebagai baris nyata milik user itu (dapat diedit dan dihapus), bukan data hardcode.
• Foto profil disimpan di Supabase Storage (bucket "avatars") dengan policy: user hanya bisa upload/ubah/hapus file di folder dengan user_id miliknya; batasi tipe dan ukuran file.
17. GOOGLE CALENDAR (DETAIL TEKNIS)
• Jangan mengandalkan provider_token dari Supabase Auth. Buat alur OAuth 2.0 terpisah via Supabase Edge Functions (authorization code flow, access_type=offline, prompt=consent).
• Scope minimal: https://www.googleapis.com/auth/calendar.events
• Simpan refresh token terenkripsi di calendar_integrations. RLS harus memblokir klien membaca kolom token; hanya Edge Function dengan service role yang mengakses. Client secret hanya di secrets Edge Function, tidak pernah di frontend.
• Sinkronisasi satu arah (aplikasi → Google Calendar): create, update, delete. Simpan google_event_id di reminders.
• Tambahkan reminders.sync_status (synced/pending/failed) dan sync_error. Bila gagal, simpan pengingat tetap berhasil dan tampilkan tombol "Coba sinkron ulang". Tangani kasus token dicabut, event sudah dihapus manual di Google (404), dan koneksi putus (tombol "Putuskan Google Calendar").
• "Pilihan notifikasi" = pengingat Google Calendar (popup dan/atau email) pada 10 menit, 30 menit, 1 jam, 1 hari sebelum, disimpan di reminders dan dikirim lewat reminders.overrides. Tambahkan juga notifikasi in-app untuk pengingat yang jatuh tempo.
• reminders memiliki task_id (FK opsional ke tasks) agar deadline tugas dapat dijadikan pengingat.
• Simpan waktu sebagai timestamptz, tampilkan dan kirim ke Google dengan zona waktu Asia/Jakarta.
• README wajib berisi langkah Google Cloud Console: aktifkan Calendar API, OAuth consent screen, daftarkan kedua email sebagai Test Users, dan atur Authorized redirect URIs. Jelaskan bahwa status Testing membuat refresh token kedaluwarsa dalam 7 hari, dan untuk pemakaian pribadi jelaskan cara mengubah status ke In production tanpa verifikasi (layar peringatan "app belum diverifikasi" akan muncul sekali saat menghubungkan dan dapat diterima karena app milik sendiri).
18. STACK TAMBAHAN
Vite, React Router, TanStack Query, React Hook Form + Zod, Tiptap, date-fns (locale id), sonner (toast), Supabase CLI untuk migration dan generate tipe TypeScript.
19. KEAMANAN DATABASE
• Setiap tabel: RLS aktif, policy terpisah SELECT/INSERT/UPDATE/DELETE, memakai (select auth.uid()) = user_id dengan USING dan WITH CHECK.
• Cegah referensi lintas-user: foreign key ke tabel induk harus divalidasi dengan check/trigger agar project_tasks, reminders, dan study_notes tidak bisa menunjuk data milik user lain.
• Trigger updated_at otomatis. Tambahkan index pada user_id, tanggal, dan kolom filter utama.
• service_role key tidak pernah ada di frontend. Sediakan .env.example.
20. UX WAJIB
• UI berbahasa Indonesia, format tanggal id-ID.
• Setiap halaman punya empty state yang informatif dengan tombol aksi, skeleton loading, dan error state dengan tombol coba lagi.
• Dialog konfirmasi sebelum menghapus.
• Pencarian global di header (shortcut Ctrl/Cmd+K) untuk catatan, tugas, dan proyek.
• Sidebar di layar kecil menjadi drawer. Pertimbangkan bottom navigation untuk mobile.
• Aksesibilitas dasar: label form, fokus terlihat, kontras cukup di kedua tema.
21. TAMBAHAN OPSIONAL (hanya jika tidak mengganggu fitur inti)
• Timer fokus/Pomodoro yang mencatat durasi ke study_sessions, sehingga grafik Statistik punya data jam belajar nyata.
• Ekspor data (catatan, tugas) ke JSON/Markdown sebagai cadangan.
22. HASIL AKHIR & URUTAN KERJA
Kerjakan bertahap dan berhenti di akhir tiap fase untuk saya cek:
1.  Migration SQL lengkap (tabel, FK, RLS, trigger, storage policy) + README setup.
2.  Auth + layout + tema (tersimpan di profiles).
3.  Pelajaran, Mata Kuliah, Tugas, To-Do.
4.  Proyek, Catatan Singkat, Pencarian, Statistik.
5.  Pengingat + Google Calendar (Edge Functions).
6.  Pengujian akhir: semua tombol berfungsi, isolasi data antar-user terbukti (coba akses data user lain harus ditolak), data tetap ada setelah refresh.
7.  Deploy ke Cloudflare Pages (lihat bagian 23).
Sertakan di akhir: struktur folder, daftar environment variable, dan panduan deploy.
23. DEPLOY (CLOUDFLARE PAGES)
• Aplikasi untuk pemakaian pribadi satu pengguna. Deploy sebagai static site ke Cloudflare Pages, terhubung ke repo GitHub dengan auto-deploy.
• Build command: npm run build, output directory: dist. Tidak perlu base path. Pastikan SPA fallback berfungsi agar refresh di rute dalam tidak 404.
• Env var (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) diisi di dashboard Cloudflare. Sediakan .env.example.
• README: langkah setup Cloudflare Pages, pengisian Site URL dan Redirect URLs Supabase dengan URL pages.dev, cara menonaktifkan signup publik setelah akun dibuat, serta catatan bahwa Supabase free tier dapat menjeda proyek setelah sekitar 1 minggu tidak aktif (data tetap aman, cukup di-restore dari dashboard Supabase).