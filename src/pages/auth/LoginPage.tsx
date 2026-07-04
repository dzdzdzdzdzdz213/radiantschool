import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const ROLE_META: Record<string, { title: string; badge: string; icon: string }> = {
  student: { title: 'Connexion Étudiant', badge: "Espace Élève", icon: '🎓' },
  admin: { title: 'Administration', badge: "Espace Admin", icon: '⚡' },
  teacher: { title: 'Connexion Enseignant', badge: "Espace Prof", icon: '📚' },
  assistant: { title: 'Connexion Assistant', badge: "Espace Assistant", icon: '📋' },
  parent: { title: 'Connexion Parent', badge: "Espace Parent", icon: '👨‍👩‍👧‍👦' },
};

export default function LoginPage() {
  const { role = 'student' } = useParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, profile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const meta = ROLE_META[role] ?? ROLE_META.student;

  useEffect(() => {
    if (profile) {
      navigate(getDefaultRoute(profile.role), { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-muted)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative">
            <button type="button" onClick={() => navigate('/')} className="absolute left-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:opacity-70" style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img src="/logo-transparent.webp" alt="Radiant Academy" className="h-10 mx-auto w-auto" />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Radiant <span style={{ color: '#a060a0' }}>Academy</span></h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>{meta.badge}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {error && (
            <div className="mb-4 rounded-lg p-3 text-sm font-medium" style={{ backgroundColor: error.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: error.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{error}</div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--fg)' }}>{t('auth.email', lang)}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none" placeholder="exemple@email.com" required style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--fg)' }}>{t('auth.password', lang)}</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none" placeholder="••••••••" required style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-muted)' }}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
            {isLoading ? '...' : t('auth.sign_in', lang)}
          </button>

          {role === 'student' && (
            <p className="mt-4 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
              {t('auth.dont_have_account', lang)} <Link to="/register" className="font-medium" style={{ color: 'var(--primary)' }}>{t('auth.register', lang)}</Link>
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--fg-muted)', opacity: 0.4 }}>
          Radiant Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
