import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithGoogle, user, profile, isLoading: authLoading } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user && !profile) {
      navigate('/complete-profile', { replace: true });
      return;
    }
    if (profile) {
      const allowed = ['student', 'parent'];
      if (!allowed.includes(profile.role)) {
        supabase.auth.signOut();
        return;
      }
      navigate(getDefaultRoute(profile.role), { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.includes('not confirmed')) {
          setError('Veuillez confirmer votre adresse email avant de vous connecter');
        } else if (error.message?.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else {
          setError('Identifiants invalides');
        }
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="gradient-mesh-fixed">
        <div className="orb" />
        <div className="orb" />
      </div>

      <div className="animate-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
          <p className="text-muted mt-1 text-sm">
            {t('login.student_space', lang)} / {t('login.parent_space', lang)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card animate-scale p-6"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="login-email" className="mb-1.5 block text-small font-medium text-foreground">
              {t('auth.email', lang)}
            </label>
            <Input
              id="login-email"
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
            <label htmlFor="login-password" className="mb-1.5 block text-small font-medium text-foreground">
              {t('auth.password', lang)}
            </label>
            <div className="relative">
              <Input
                id="login-password"
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? t('common.loading', lang) : t('auth.sign_in', lang)}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--fg-muted)' }}>{t('common.or', lang)}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => { setGoogleLoading(true); signInWithGoogle(); }}
            disabled={googleLoading}
            className="w-full"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {t('auth.continue_with_google', lang)}
          </Button>

          <p className="mt-5 text-center text-small text-muted-foreground">
            {t('auth.dont_have_account', lang)}{' '}
            <Link to="/enroll" className="font-medium text-primary hover:underline">
              {t('auth.register', lang)}
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          {t('login.copyright', lang, String(new Date().getFullYear()))}
        </p>
      </div>
    </div>
  );
}
