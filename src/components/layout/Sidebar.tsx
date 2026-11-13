import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  ListTodo,
  Bell,
  FolderKanban,
  StickyNote,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Pelajaran', path: '/lessons', icon: BookOpen },
    { label: 'Mata Kuliah', path: '/subjects', icon: BookMarked },
    { label: 'Tugas', path: '/tasks', icon: CheckSquare },
    { label: 'To-Do List', path: '/todos', icon: ListTodo },
    { label: 'Pengingat', path: '/reminders', icon: Bell },
    { label: 'Proyek', path: '/projects', icon: FolderKanban },
    { label: 'Catatan Singkat', path: '/quick-notes', icon: StickyNote },
    { label: 'Statistik', path: '/statistics', icon: BarChart3 },
    { label: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/95 transition-all duration-300 ease-in-out z-30 select-none h-screen',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5 stroke-[2]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-foreground">
                MyStudySpace
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Personal Dashboard
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative group min-h-[40px]',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[1.8]" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block z-50 whitespace-nowrap border border-border">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/80">
        <div
          className={cn(
            'flex items-center rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && (
            <span className="font-medium truncate">Desman Halawa</span>
          )}
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
};

