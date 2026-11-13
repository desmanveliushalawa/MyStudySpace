-- ==============================================================================
-- MYSTUDYSPACE: INITIAL DATABASE SCHEMA MIGRATION
-- Project: Personal Study Dashboard
-- Author: Desman Halawa
-- Description: Complete schema, tables, foreign keys, anti-cross-user triggers,
--              auto-updated_at triggers, user registration trigger (profiles + 3 default projects),
--              Row Level Security (RLS) policies, storage bucket policies, and performance indexes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ------------------------------------------------------------------------------

-- (1) PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (2) SUBJECTS (Mata Kuliah)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    color TEXT NOT NULL DEFAULT '#8A9A86', -- Sage green default
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (3) STUDY_NOTES (Catatan Pelajaran)
CREATE TABLE IF NOT EXISTS public.study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    note_date DATE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
    status TEXT NOT NULL DEFAULT 'belum_dipelajari' CHECK (status IN ('belum_dipelajari', 'sedang_dipelajari', 'selesai')),
    reference_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (4) TASKS (Tugas Perkuliahan)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi')),
    status TEXT NOT NULL DEFAULT 'belum_dikerjakan' CHECK (status IN ('belum_dikerjakan', 'sedang_dikerjakan', 'selesai')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (5) TODO_ITEMS (Daftar To-Do)
CREATE TABLE IF NOT EXISTS public.todo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'belajar' CHECK (category IN ('belajar', 'kuliah', 'pribadi', 'lainnya')),
    due_date DATE,
    priority TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi')),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (6) PROJECTS (Proyek Belajar / Kuliah)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    priority TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi')),
    status TEXT NOT NULL DEFAULT 'belum_dimulai' CHECK (status IN ('belum_dimulai', 'sedang_berjalan', 'selesai')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (7) PROJECT_TASKS (Tugas di Dalam Proyek)
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (8) STUDY_SESSIONS (Sesi & Jadwal Belajar / Pomodoro)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (9) QUICK_NOTES (Catatan Singkat / Cepat)
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#FAF8F5',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (10) REMINDERS (Pengingat Deadline / Jadwal)
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    remind_at TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL DEFAULT 'umum',
    notification_type TEXT NOT NULL DEFAULT 'popup' CHECK (notification_type IN ('popup', 'email', 'both')),
    notification_lead_time TEXT NOT NULL DEFAULT '30m' CHECK (notification_lead_time IN ('10m', '30m', '1h', '1d')),
    google_event_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'failed')),
    sync_error TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (11) CALENDAR_INTEGRATIONS (Koneksi Google Calendar)
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    provider TEXT NOT NULL DEFAULT 'google',
    access_token_enc TEXT,
    refresh_token_enc TEXT,
    token_expires_at TIMESTAMPTZ,
    google_email TEXT,
    is_connected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (12) ACTIVITY_LOG (Log Aktivitas Pengguna)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('study_note', 'task', 'todo', 'project', 'study_session', 'quick_note')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'complete', 'delete')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INTEGRITY & ANTI-CROSS-USER FOREIGN KEY TRIGGERS
-- Menjamin relasi FK tidak dapat merujuk data milik user_id lain.
-- ------------------------------------------------------------------------------

-- Validasi subject_id pada study_notes
CREATE OR REPLACE FUNCTION public.check_note_subject_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subject_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = NEW.subject_id AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Keamanan Integritas: subject_id (%) bukan milik user_id (%)', NEW.subject_id, NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_note_subject
    BEFORE INSERT OR UPDATE OF subject_id, user_id ON public.study_notes
    FOR EACH ROW EXECUTE FUNCTION public.check_note_subject_ownership();

-- Validasi subject_id pada tasks
CREATE OR REPLACE FUNCTION public.check_task_subject_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subject_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = NEW.subject_id AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Keamanan Integritas: subject_id (%) bukan milik user_id (%)', NEW.subject_id, NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_task_subject
    BEFORE INSERT OR UPDATE OF subject_id, user_id ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.check_task_subject_ownership();

-- Validasi project_id pada project_tasks
CREATE OR REPLACE FUNCTION public.check_project_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = NEW.project_id AND user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Keamanan Integritas: project_id (%) bukan milik user_id (%)', NEW.project_id, NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_project_task
    BEFORE INSERT OR UPDATE OF project_id, user_id ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION public.check_project_task_ownership();

-- Validasi task_id pada reminders
CREATE OR REPLACE FUNCTION public.check_reminder_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.task_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.tasks
            WHERE id = NEW.task_id AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Keamanan Integritas: task_id (%) bukan milik user_id (%)', NEW.task_id, NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_reminder_task
    BEFORE INSERT OR UPDATE OF task_id, user_id ON public.reminders
    FOR EACH ROW EXECUTE FUNCTION public.check_reminder_task_ownership();

-- Validasi subject_id pada study_sessions
CREATE OR REPLACE FUNCTION public.check_session_subject_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subject_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = NEW.subject_id AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Keamanan Integritas: subject_id (%) bukan milik user_id (%)', NEW.subject_id, NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_session_subject
    BEFORE INSERT OR UPDATE OF subject_id, user_id ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION public.check_session_subject_ownership();

-- ------------------------------------------------------------------------------
-- 4. AUTO-UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_study_notes_updated_at BEFORE UPDATE ON public.study_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_todo_items_updated_at BEFORE UPDATE ON public.todo_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_calendar_integrations_updated_at BEFORE UPDATE ON public.calendar_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. AUTO-CREATE PROFILE & INITIAL 3 PROJECTS ON SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Insert ke tabel profiles
    INSERT INTO public.profiles (id, full_name, theme_preference)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'light'
    );

    -- 2. Buat 3 proyek awal default yang nyata dan dapat diedit/dihapus oleh pemilik
    INSERT INTO public.projects (user_id, name, description, priority, status)
    VALUES
        (NEW.id, 'Proyek 1', 'Proyek awal untuk mengatur target belajar semester ini', 'sedang', 'belum_dimulai'),
        (NEW.id, 'Proyek 2', 'Proyek penelitian atau tugas kelompok perkuliahan', 'sedang', 'belum_dimulai'),
        (NEW.id, 'Proyek 3', 'Proyek persiapan ujian, sertifikasi, dan portofolio', 'tinggi', 'belum_dimulai');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Kebijakan isolasi data per-user yang ketat dengan SELECT, INSERT, UPDATE, DELETE.
-- ------------------------------------------------------------------------------

-- (1) PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING ((SELECT auth.uid()) = id);

-- (2) SUBJECTS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_select_own" ON public.subjects FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "subjects_insert_own" ON public.subjects FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "subjects_update_own" ON public.subjects FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "subjects_delete_own" ON public.subjects FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (3) STUDY_NOTES
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_notes_select_own" ON public.study_notes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_notes_insert_own" ON public.study_notes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_notes_update_own" ON public.study_notes FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_notes_delete_own" ON public.study_notes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (4) TASKS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (5) TODO_ITEMS
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todo_items_select_own" ON public.todo_items FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "todo_items_insert_own" ON public.todo_items FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "todo_items_update_own" ON public.todo_items FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "todo_items_delete_own" ON public.todo_items FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (6) PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (7) PROJECT_TASKS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_select_own" ON public.project_tasks FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "project_tasks_insert_own" ON public.project_tasks FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "project_tasks_update_own" ON public.project_tasks FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "project_tasks_delete_own" ON public.project_tasks FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (8) STUDY_SESSIONS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_sessions_select_own" ON public.study_sessions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_sessions_update_own" ON public.study_sessions FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "study_sessions_delete_own" ON public.study_sessions FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (9) QUICK_NOTES
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quick_notes_select_own" ON public.quick_notes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "quick_notes_insert_own" ON public.quick_notes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "quick_notes_update_own" ON public.quick_notes FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "quick_notes_delete_own" ON public.quick_notes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (10) REMINDERS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select_own" ON public.reminders FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "reminders_insert_own" ON public.reminders FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "reminders_update_own" ON public.reminders FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "reminders_delete_own" ON public.reminders FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- (11) CALENDAR_INTEGRATIONS (Akses token terproteksi)
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya boleh melihat status koneksi kalender miliknya
CREATE POLICY "calendar_select_own" ON public.calendar_integrations FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_insert_own" ON public.calendar_integrations FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_update_own" ON public.calendar_integrations FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "calendar_delete_own" ON public.calendar_integrations FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Proteksi Kolom Token dari Klien Frontend:
-- Memblokir klien frontend membaca access_token_enc & refresh_token_enc secara langsung
REVOKE SELECT (access_token_enc, refresh_token_enc) ON public.calendar_integrations FROM authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_integrations TO service_role;

-- (12) ACTIVITY_LOG
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select_own" ON public.activity_log FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_log_insert_own" ON public.activity_log FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_log_update_own" ON public.activity_log FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_log_delete_own" ON public.activity_log FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE: AVATARS BUCKET & POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- Batas ukuran 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS Policies
CREATE POLICY "avatars_view_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "avatars_upload_own_folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = (SELECT auth.uid()::text)
    );

CREATE POLICY "avatars_update_own_folder"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = (SELECT auth.uid()::text)
    )
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = (SELECT auth.uid()::text)
    );

CREATE POLICY "avatars_delete_own_folder"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = (SELECT auth.uid()::text)
    );

-- ------------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- Optimalisasi query pada user_id, tanggal, dan status filter utama.
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_user_date ON public.study_notes(user_id, note_date);
CREATE INDEX IF NOT EXISTS idx_study_notes_subject ON public.study_notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_status ON public.study_notes(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_subject ON public.tasks(subject_id);

CREATE INDEX IF NOT EXISTS idx_todo_user_due ON public.todo_items(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_todo_user_completed ON public.todo_items(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user ON public.project_tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_time ON public.study_sessions(user_id, start_at);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user ON public.quick_notes(user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_time ON public.reminders(user_id, remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_sync_status ON public.reminders(user_id, sync_status);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_time ON public.activity_log(user_id, created_at DESC);

