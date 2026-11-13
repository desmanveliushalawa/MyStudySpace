import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/common/LoadingState';

export const ProtectedRoute: React.FC = () => {
  const { session, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full">
          <LoadingState rows={3} />
        </div>
      </div>
    );
  }

  // Jika Supabase belum di-setup di .env, kita izinkan masuk dalam demo preview mode
  if (!isConfigured) {
    return <Outlet />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

