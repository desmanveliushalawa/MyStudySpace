import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Gagal mengirim tautan reset: ' + error.message);
      } else {
        setSent(true);
        toast.success('Tautan pemulihan kata sandi telah dikirim ke email Anda.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat reset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-border/80 shadow-floating">
          <CardHeader>
            <CardTitle className="text-lg">Atur Ulang Kata Sandi</CardTitle>
            <CardDescription>
              Masukkan alamat email terdaftar untuk menerima tautan pemulihan
            </CardDescription>
          </CardHeader>

          {sent ? (
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Periksa Kotak Masuk Anda</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tautan konfirmasi reset kata sandi telah dikirimkan ke <strong className="text-foreground">{email}</strong>. Silakan buka tautan tersebut untuk membuat sandi baru.
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleReset}>
              <CardContent className="space-y-4">
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
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirimkan...
                    </>
                  ) : (
                    'Kirim Tautan Pemulihan'
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          <div className="border-t border-border/80 p-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

