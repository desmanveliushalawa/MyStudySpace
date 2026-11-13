import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  ListTodo,
  FolderKanban,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Pelajaran', path: '/lessons', icon: BookOpen },
    { label: 'Tugas', path: '/tasks', icon: CheckSquare },
    { label: 'To-Do', path: '/todos', icon: ListTodo },
    { label: 'Proyek', path: '/projects', icon: FolderKanban },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors min-h-[44px] min-w-[44px]',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5 stroke-[1.8]" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

