import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft, Loader2, BookOpen, Users, Sparkles, GraduationCap, Shield, Heart } from 'lucide-react';
import { asset } from '@/lib/assets';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

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
    { icon: BookOpen, title: 'Formations', desc: 'Suivez vos cours en temps réel', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, title: 'Communauté', desc: 'Échangez avec vos enseignants', color: 'from-violet-500 to-purple-500' },
    { icon: GraduationCap, title: 'Progression', desc: 'Suivez vos résultats et objectifs', color: 'from-amber-500 to-orange-500' },
    { icon: Heart, title: 'Bien-être', desc: 'Un suivi personnalisé et humain', color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-purple-500/20 blur-[40px]" />
        <div className="orb-2 absolute top-[60%] right-[10%] w-96 h-96 rounded-full bg-pink-500/15 blur-[40px]" />
        <div className="orb-3 absolute bottom-[15%] left-[40%] w-64 h-64 rounded-full bg-blue-500/20 blur-[30px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Left panel — brand (desktop) */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-10 text-white z-10">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Radiant Academy</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-[1.1]">
              Votre espace<br />
              <span className="text-gradient-animated">éducatif</span>
            </h2>
            <p className="mt-4 text-white/50 text-sm max-w-sm leading-relaxed">
              Connectez-vous pour suivre vos formations, consulter vos résultats et rester informé de tout.
            </p>
          </motion.div>

          <div className="space-y-3 stagger-children">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 glass-card rounded-2xl p-4 cursor-default">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-xs text-white/30"
        >
          © {new Date().getFullYear()} Radiant Academy
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className="w-full max-w-sm"
        >
          {/* Mobile header */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back', lang)}
            </Link>
            <img src={asset('logo-transparent.webp')} alt="Radiant Academy" className="mx-auto h-10 w-auto brightness-0 invert" />
            <h1 className="text-xl font-bold mt-3 text-gradient-animated">
              Radiant Academy
            </h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Bienvenue
            </h1>
            <p className="text-white/40 text-sm mt-2">
              {t('login.student_space', lang)} / {t('login.parent_space', lang)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm px-4 py-3 text-sm font-medium text-red-300"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ease }}
              className="space-y-1.5"
            >
              <label htmlFor="login-email" className="block text-sm font-medium text-white/70">
                {t('auth.email', lang)}
              </label>
              <Input
                id="login-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20 focus-visible:border-white/20"
                placeholder={t('login.email_placeholder', lang)}
                autoFocus
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, ease }}
              className="space-y-1.5"
            >
              <label htmlFor="login-password" className="block text-sm font-medium text-white/70">
                {t('auth.password', lang)}
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20 focus-visible:border-white/20 pr-11"
                  placeholder={t('login.password_placeholder', lang)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease }}
              className="text-right"
            >
              <Link to="/forgot-password" className="text-sm font-medium text-purple-300/80 hover:text-purple-200 transition-colors">
                {t('auth.forgot_password', lang)}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, ease }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? t('common.loading', lang) : t('auth.sign_in', lang)}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, ease }}
              className="relative my-5"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black/50 backdrop-blur-sm px-3 text-white/30">{t('common.or', lang)}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ease }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => { setGoogleLoading(true); signInWithGoogle(); }}
                disabled={googleLoading}
                className="w-full h-12 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
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
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, ease }}
              className="text-center text-sm text-white/30 pt-2"
            >
              {t('auth.dont_have_account', lang)}{' '}
              <Link to="/enroll" className="font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                {t('auth.register', lang)}
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
