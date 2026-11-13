import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('mystudyspace-theme') as ThemePreference;
    return saved || 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    let effectiveDark = false;

    if (theme === 'system') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      effectiveDark = theme === 'dark';
    }

    setIsDark(effectiveDark);

    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('mystudyspace-theme', theme);
  }, [theme]);

  // Listener untuk perubahan system theme
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
        setIsDark(true);
      } else {
        root.classList.remove('dark');
        setIsDark(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = async (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem('mystudyspace-theme', newTheme);

    // Simpan ke database jika user sudah login
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch {
      // Abaikan jika offline / belum ada koneksi db
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
};

