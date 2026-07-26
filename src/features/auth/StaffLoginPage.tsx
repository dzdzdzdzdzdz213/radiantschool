import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft, ShieldAlert, Loader2, Clock } from 'lucide-react';
import { asset } from '@/lib/assets';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLockout(key: string): { locked: boolean; remainingMs: number } {
  const record = failedAttempts.get(key);
  if (!record) return { locked: false, remainingMs: 0 };
  if (Date.now() > record.lockedUntil) {
    failedAttempts.delete(key);
    return { locked: false, remainingMs: 0 };
  }
  return { locked: record.count >= LOCKOUT_ATTEMPTS, remainingMs: record.lockedUntil - Date.now() };
}

function recordFailedAttempt(key: string) {
  const record = failedAttempts.get(key) ?? { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= LOCKOUT_ATTEMPTS) record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  else if (record.count === 1) record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  failedAttempts.set(key, record);
}

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingLockout, setRemainingLockout] = useState(0);
  const { signIn, profile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const lockoutKey = `staff_login:${email.toLowerCase().trim()}`;

  useEffect(() => {
    return () => { if (lockTimerRef.current) clearInterval(lockTimerRef.current); };
  }, []);

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

  useEffect(() => {
    const { locked, remainingMs } = checkLockout(lockoutKey);
    if (locked && remainingMs > 0) {
      setRemainingLockout(remainingMs);
      lockTimerRef.current = setInterval(() => {
        const { remainingMs: rem } = checkLockout(lockoutKey);
        if (rem <= 0) { setRemainingLockout(0); if (lockTimerRef.current) clearInterval(lockTimerRef.current); }
        else setRemainingLockout(rem);
      }, 1000);
    }
  }, [email, lockoutKey]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { locked, remainingMs } = checkLockout(lockoutKey);
    if (locked) {
      setRemainingLockout(remainingMs);
      setError(`Trop de tentatives. Réessayez dans ${Math.ceil(remainingMs / 60000)} min.`);
      return;
    }

    if (password.length < 3) {
      setError('Mot de passe trop court');
      return;
    }

    setIsLoading(true);

    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.error) {
      recordFailedAttempt(lockoutKey);
      const { locked: nowLocked, remainingMs: nowRemaining } = checkLockout(lockoutKey);
      if (nowLocked) {
        setRemainingLockout(nowRemaining);
        setError(`Trop de tentatives. Réessayez dans ${Math.ceil(nowRemaining / 60000)} min.`);
      } else {
        setError('Identifiants invalides');
      }
      setPassword('');
      return;
    }

    const { data: userData } = await (supabase as any)
      .from('users')
      .select('role, status')
      .eq('email', email)
      .single();

    if (!userData) {
      setError('Aucun compte associé. Veuillez vérifier votre email ou contacter l\'administration.');
      await supabase.auth.signOut();
      return;
    }

    const allowed = ['admin', 'teacher', 'assistant'];
    if (!allowed.includes(userData.role)) {
      setError('Accès refusé');
      await supabase.auth.signOut();
      return;
    }

    if (userData.status !== 'active') {
      setError('Compte désactivé. Contactez l\'administration.');
      await supabase.auth.signOut();
      return;
    }

    failedAttempts.delete(lockoutKey);
  }, [email, password, signIn, lockoutKey]);

  const formatLockoutTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
            <img src={asset('logo-transparent.webp')} alt="Radiant Learning" className="mx-auto h-12 w-auto" />
          </div>
          <h1 className="text-h1 mt-4">
            <span className="text-gradient">Radiant Learning</span>
          </h1>
          <p className="text-muted mt-1 text-sm">{t('login.admin_space', lang)}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-3 w-3" />
            Accès restreint
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card animate-scale p-6"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {remainingLockout > 0 ? <Clock className="h-4 w-4 shrink-0 animate-pulse" /> : <ShieldAlert className="h-4 w-4 shrink-0" />}
              <span>{error}</span>
              {remainingLockout > 0 && (
                <span className="ml-auto font-mono tabular-nums text-xs">{formatLockoutTime(remainingLockout)}</span>
              )}
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
              autoComplete="off"
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
                autoComplete="off"
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

          <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground/40">
            {t('login.restricted_access', lang)}
            <br />Connexion sécurisée · Chiffrement TLS
          </p>
      </div>
    </div>
  );
}
