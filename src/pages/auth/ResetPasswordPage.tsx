import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { lang } = useLang();
  const pwRef = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email_confirmed_at) {
        navigate('/login', { replace: true });
      }
      setChecking(false);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(t('errors.save_error', lang, t('auth.password', lang)));
      else { setDone(true); redirectTimer.current = setTimeout(() => navigate('/login'), 2000); }
    } catch {
      setError(t('errors.network', lang));
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background handled globally by AnimatedBackground */}

      <div className="animate-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-h1 mt-4">{t('auth.reset_password', lang)}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('auth.reset_password_desc', lang)}</p>
        </div>

        {done ? (
          <div className="card animate-scale p-8 text-center" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold">{t('auth.password_reset', lang)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t('auth.back_to_login', lang)}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card animate-scale p-6" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {error && (
              <div className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="new-password" className="mb-1.5 block text-small font-medium text-foreground">
                {t('auth.new_password', lang)}
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  ref={pwRef}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-11"
                  placeholder="••••••••"
                  minLength={8}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? t('auth.password', lang) : t('auth.password', lang)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading || password.length < 8} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? t('common.loading', lang) : t('auth.reset_password', lang)}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
