import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTimeGreeting, formatDateID } from '@/lib/utils';
import {
  Search,
  Sun,
  Moon,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
}) => {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const greeting = getTimeGreeting();
  const currentDate = formatDateID(new Date());

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Desman';
  const initial = displayName.charAt(0).toUpperCase();

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 glass-header px-4 md:px-6">
      {/* Left: Mobile Menu Toggle & Greeting */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden text-foreground"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          <h2 className="text-sm md:text-base font-bold text-foreground">
            {greeting}, <span className="text-primary">{displayName}</span>
          </h2>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Right: Search, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden sm:flex h-9 items-center gap-2 rounded-lg bg-card/60 px-3 text-xs text-muted-foreground hover:bg-card hover:text-foreground border-border/80"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Cari catatan, tugas, proyek...</span>
          <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
            Ctrl K
          </kbd>
        </Button>

        {/* Mobile Search Icon Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSearch}
          className="sm:hidden text-muted-foreground hover:text-foreground"
          aria-label="Pencarian"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ring-offset-background hover:ring-2 hover:ring-primary/20"
              aria-label="Menu profil pengguna"
            >
              <Avatar className="h-9 w-9">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email || 'desmanhalawa2020@gmail.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

