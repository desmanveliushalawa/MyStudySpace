import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon isi alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error('Gagal masuk: ' + error.message);
      } else {
        toast.success('Berhasil masuk ke MyStudySpace');
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background selection:bg-sage-200">
      <div className="w-full max-w-md space-y-6">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-floating">
            <GraduationCap className="h-6 w-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            MyStudySpace
          </h1>
          <p className="text-sm text-muted-foreground">
            Masuk ke ruang catatan dan produktivitas belajar pribadi Anda
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Konfigurasi Supabase Belum Terhubung</p>
              <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80">
                Isi variabel <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> dan <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> pada file <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* Card Form */}
        <Card className="border-border/80 shadow-floating">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Masuk Akun</CardTitle>
              <CardDescription>
                Gunakan email pemilik yang telah terdaftar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="desmanhalawa2020@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground" htmlFor="password">
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Belum memiliki akun?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

