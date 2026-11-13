export type ThemePreference = 'light' | 'dark' | 'system';
export type NoteStatus = 'belum_dipelajari' | 'sedang_dipelajari' | 'selesai';
export type Priority = 'rendah' | 'sedang' | 'tinggi';
export type TaskStatus = 'belum_dikerjakan' | 'sedang_dikerjakan' | 'selesai';
export type TodoCategory = 'belajar' | 'kuliah' | 'pribadi' | 'lainnya';
export type ProjectStatus = 'belum_dimulai' | 'sedang_berjalan' | 'selesai';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type NotificationType = 'popup' | 'email' | 'both';
export type NotificationLeadTime = '10m' | '30m' | '1h' | '1d';
export type SyncStatus = 'synced' | 'pending' | 'failed';
export type EntityType = 'study_note' | 'task' | 'todo' | 'project' | 'study_session' | 'quick_note';
export type ActionType = 'create' | 'update' | 'complete' | 'delete';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_preference: ThemePreference;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface StudyNote {
  id: string;
  user_id: string;
  subject_id: string | null;
  note_date: string; // YYYY-MM-DD
  title: string;
  content: Record<string, unknown> | string; // Tiptap JSON or string
  status: NoteStatus;
  reference_links: ReferenceLink[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  subject?: Subject;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  due_date: string;
  priority: Priority;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  subject?: Subject;
}

export interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  category: TodoCategory;
  due_date: string | null;
  priority: Priority;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  priority: Priority;
  status: ProjectStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins & Computations
  tasks?: ProjectTask[];
  task_count?: number;
  completed_task_count?: number;
  progress_percent?: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  start_at: string;
  end_at: string | null;
  duration_minutes: number;
  status: SessionStatus;
  completed_at: string | null;
  created_at: string;
  // Joins
  subject?: Subject;
}

export interface QuickNote {
  id: string;
  user_id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  remind_at: string;
  category: string;
  notification_type: NotificationType;
  notification_lead_time: NotificationLeadTime;
  google_event_id: string | null;
  sync_status: SyncStatus;
  sync_error: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  task?: Task;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: 'google';
  google_email: string | null;
  is_connected: boolean;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActionType;
  details: Record<string, unknown>;
  created_at: string;
}

