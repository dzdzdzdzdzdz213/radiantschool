import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft, Loader2, BookOpen, GraduationCap, Users } from 'lucide-react';
import { asset } from '@/lib/assets';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

  const features = [
    { icon: BookOpen, title: 'Suivi des formations', desc: 'Accédez à vos cours et emplois du temps' },
    { icon: GraduationCap, title: 'Résultats & bulletins', desc: 'Consultez vos notes et progrès' },
    { icon: Users, title: 'Communauté', desc: 'Échangez avec enseignants et camarades' },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left panel — brand */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_40%)]" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,currentColor 1px,transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
        </div>

        <div className="relative z-10 space-y-12">
          <div>
            <img src={asset('logo-transparent.webp')} alt="Radiant Academy" className="h-12 w-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Votre espace<br />éducatif
            </h2>
            <p className="mt-3 text-white/70 text-sm max-w-xs leading-relaxed">
              Connectez-vous pour suivre vos formations, consulter vos résultats et rester informé.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Radiant Academy
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', lang)}
            </Link>
            <img src={asset('logo-transparent.webp')} alt="Radiant Academy" className="mx-auto h-10 w-auto" />
            <h1 className="text-xl font-bold mt-3">
              <span className="text-gradient">Radiant Academy</span>
            </h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('login.student_space', lang)} / {t('login.parent_space', lang)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-foreground">
                {t('auth.email', lang)}
              </label>
              <Input
                id="login-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                placeholder={t('login.email_placeholder', lang)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                {t('auth.password', lang)}
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-11"
                  placeholder={t('login.password_placeholder', lang)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? t('auth.password', lang) : t('auth.password', lang)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                {t('auth.forgot_password', lang)}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? t('common.loading', lang) : t('auth.sign_in', lang)}
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">{t('common.or', lang)}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => { setGoogleLoading(true); signInWithGoogle(); }}
              disabled={googleLoading}
              className="w-full h-11 rounded-xl"
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

            <p className="text-center text-sm text-muted-foreground pt-2">
              {t('auth.dont_have_account', lang)}{' '}
              <Link to="/enroll" className="font-semibold text-primary hover:underline">
                {t('auth.register', lang)}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
