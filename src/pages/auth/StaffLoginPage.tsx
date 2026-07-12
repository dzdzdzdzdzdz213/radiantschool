import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, profile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Staff Portal';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { if (meta.parentElement) meta.parentElement.removeChild(meta); };
  }, []);

  useEffect(() => {
    if (profile) {
      const allowed = ['admin', 'teacher', 'assistant'];
      if (allowed.includes(profile.role)) {
        navigate(getDefaultRoute(profile.role), { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.error) {
      setError(t('auth.invalid_credentials', lang));
      return;
    }

    const { data: userData } = await (supabase as any)
      .from('users')
      .select('role, status')
      .eq('email', email)
      .single();

    if (!userData) {
      setError(t('errors.permission', lang));
      await supabase.auth.signOut();
      return;
    }

    const allowed = ['admin', 'teacher', 'assistant'];
    if (!allowed.includes(userData.role)) {
      setError(t('errors.permission', lang));
      await supabase.auth.signOut();
      return;
    }

    if (userData.status !== 'active') {
      setError(t('auth.account_disabled', lang));
      await supabase.auth.signOut();
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background handled globally by AnimatedBackground */}

      <div className="animate-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label={t('common.back', lang)}
              className="btn-ghost absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img src="/logo-transparent.webp" alt="Radiant Academy" className="mx-auto h-10 w-auto" />
          </div>
          <h1 className="text-h1 mt-3">
            <span className="text-gradient">Radiant Academy</span>
          </h1>
          <p className="text-muted mt-1 text-sm">{t('login.admin_space', lang)}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card animate-scale p-6"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="staff-email" className="mb-1.5 block text-small font-medium text-foreground">
              {t('auth.email', lang)}
            </label>
            <Input
              id="staff-email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder={t('login.email_placeholder', lang)}
              autoFocus
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="staff-password" className="mb-1.5 block text-small font-medium text-foreground">
              {t('auth.password', lang)}
            </label>
            <div className="relative">
              <Input
                id="staff-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-11"
                placeholder={t('login.password_placeholder', lang)}
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

          <div className="mb-5 text-right">
            <Link to="/forgot-password" className="text-small font-medium text-primary hover:underline">
              {t('auth.forgot_password', lang)}
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? t('common.loading', lang) : t('auth.sign_in', lang)}
          </Button>
        </form>

          <p className="mt-6 text-center text-xs text-muted-foreground/40">
            {t('login.restricted_access', lang)}
          </p>
      </div>
    </div>
  );
}
