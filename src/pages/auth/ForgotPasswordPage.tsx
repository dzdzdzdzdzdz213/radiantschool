import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang } = useLang();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">{t('auth.forgot_password', lang)}</h1>
          <p className="text-muted">{t('auth.forgot_password_desc', lang)}</p>
        </div>
        {sent ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <p className="text-green-600 font-medium">{t('auth.reset_sent', lang)}</p>
            <p className="mt-2 text-sm text-muted">Vérifiez votre boîte de réception.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-8 shadow-sm">
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium">{t('auth.email', lang)}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">{loading ? 'Envoi...' : t('common.send', lang)}</button>
            <p className="mt-4 text-center text-sm text-muted">
              <Link to="/login" className="text-primary hover:underline">Retour à la connexion</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
