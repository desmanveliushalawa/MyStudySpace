import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LessonsPage } from '@/pages/lessons/LessonsPage';
import { SubjectsPage } from '@/pages/subjects/SubjectsPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { TodosPage } from '@/pages/todos/TodosPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { RemindersPage } from '@/pages/reminders/RemindersPage';
import { QuickNotesPage } from '@/pages/quick-notes/QuickNotesPage';
import { StatisticsPage } from '@/pages/statistics/StatisticsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 menit caching
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/lessons" element={<LessonsPage />} />
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/todos" element={<TodosPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/reminders" element={<RemindersPage />} />
                  <Route path="/quick-notes" element={<QuickNotesPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
