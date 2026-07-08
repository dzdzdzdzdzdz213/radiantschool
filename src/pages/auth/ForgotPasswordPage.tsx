import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang } = useLang();
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) setError(t('errors.send_error', lang, t('auth.email', lang)));
      else setSent(true);
    } catch {
      setError(t('errors.network', lang));
    } finally {
      setLoading(false);
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
            <Link to="/login" className="btn-ghost absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 p-0" aria-label={t('common.back', lang)}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-h1 mt-4">{t('auth.forgot_password', lang)}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('auth.forgot_password_desc', lang)}</p>
        </div>

        {sent ? (
          <div className="card animate-scale p-8 text-center" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold">{t('auth.reset_sent', lang)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.check_inbox', lang)}</p>
            <Link to="/login" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
              {t('auth.back_to_login', lang)}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card animate-scale p-6" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {error && (
              <div className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="reset-email" className="mb-1.5 block text-small font-medium text-foreground">
                {t('auth.email', lang)}
              </label>
              <Input
                id="reset-email"
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

            <Button type="submit" disabled={loading || !email.trim()} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? t('forgot.sending', lang) : t('common.send', lang)}
            </Button>

            <p className="mt-5 text-center text-small text-muted-foreground">
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t('auth.back_to_login', lang)}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
