import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Lock, Moon, Sun, Monitor, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Desman Halawa';
  const initial = displayName.charAt(0).toUpperCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profil berhasil diperbarui');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validasi ukuran < 2MB dan format
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto profil maksimal 2MB.');
      return;
    }

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlWithCacheBust, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      await refreshProfile();
      toast.success('Foto profil berhasil diunggah');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto profil';
      toast.error(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success('Kata sandi berhasil diubah.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah kata sandi';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border/80">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Pengaturan Akun & Tampilan
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Kelola profil pengguna, preferensi tema, dan keamanan akun MyStudySpace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <Card className="p-6 text-center border-border/80 h-fit space-y-4">
          <div className="relative mx-auto h-24 w-24">
            <Avatar className="h-24 w-24 border-2 border-border shadow-elevation">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
              title="Unggah foto profil"
            >
              {avatarUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">{displayName}</h3>
            <p className="text-xs text-muted-foreground">{user?.email || 'desmanhalawa2020@gmail.com'}</p>
          </div>

          <div className="pt-3 border-t border-border/80 text-[11px] text-muted-foreground text-left space-y-1">
            <p><strong>Status Akun:</strong> Terverifikasi (Pemilik)</p>
            <p><strong>Tipe Akses:</strong> Full Access Personal</p>
          </div>
        </Card>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Theme Preferences */}
          <Card className="border-border/80 p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold">Preferensi Tema Tampilan</CardTitle>
              <CardDescription className="text-xs">
                Pilih tema tampilan yang paling nyaman untuk mata Anda
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-card hover:bg-secondary text-muted-foreground'
                }`}
              >
                <Sun className="h-5 w-5 text-amber-500" />
                <span>Mode Terang (Sage)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-card hover:bg-secondary text-muted-foreground'
                }`}
              >
                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <span>Mode Gelap (Navy)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-2 transition-all ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-card hover:bg-secondary text-muted-foreground'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span>Sesuai Sistem</span>
              </button>
            </div>
          </Card>

          {/* Profile Name */}
          <Card className="border-border/80 p-5">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-semibold">Informasi Profil</CardTitle>
                <CardDescription className="text-xs">
                  Perbarui nama lengkap yang ditampilkan pada sapaan dashboard
                </CardDescription>
              </CardHeader>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Desman Halawa"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Alamat Email Terdaftar</label>
                <Input
                  value={user?.email || 'desmanhalawa2020@gmail.com'}
                  disabled
                  className="h-9 text-xs bg-muted/50 cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email akun pemilik terikat dengan sistem autentikasi Supabase.
                </p>
              </div>

              <Button type="submit" size="sm" disabled={savingProfile} className="text-xs">
                {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </Button>
            </form>
          </Card>

          {/* Security & Password */}
          <Card className="border-border/80 p-5">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  Keamanan & Kata Sandi
                </CardTitle>
                <CardDescription className="text-xs">
                  Ganti kata sandi akun untuk menjaga keamanan data studi Anda
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Kata Sandi Baru</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Konfirmasi Kata Sandi</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi baru"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={savingPassword || !newPassword}
                className="text-xs"
              >
                {savingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
