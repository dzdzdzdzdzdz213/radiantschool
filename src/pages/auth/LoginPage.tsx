import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import { Eye, EyeOff, Loader, Key, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const ROLE_META: Record<string, { title: string; badge: string; icon: string }> = {
  student: { title: 'Connexion Étudiant', badge: "Espace Élève", icon: '🎓' },
  admin: { title: 'Administration', badge: "Espace Admin", icon: '⚡' },
  teacher: { title: 'Connexion Enseignant', badge: "Espace Prof", icon: '📚' },
  assistant: { title: 'Connexion Assistant', badge: "Espace Assistant", icon: '📋' },
  parent: { title: 'Connexion Parent', badge: "Espace Parent", icon: '👨‍👩‍👧‍👦' },
};

const DEMOS = [
  { role: 'student', email: 'demo.etudiant@radiant-academy.xyz', label: 'Étudiant', firstName: 'Ahmed', lastName: 'Demo' },
  { role: 'teacher', email: 'demo.prof@radiant-academy.xyz', label: 'Professeur', firstName: 'Sami', lastName: 'Demo' },
  { role: 'assistant', email: 'demo.assistant@radiant-academy.xyz', label: 'Assistant', firstName: 'Leila', lastName: 'Demo' },
  { role: 'admin', email: 'demo.admin@radiant-academy.xyz', label: 'Admin', firstName: 'Admin', lastName: 'Demo' },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export default function LoginPage() {
  const { role = 'student' } = useParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [svcKey, setSvcKey] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const { signIn, signUp, profile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const meta = ROLE_META[role] ?? ROLE_META.student;

  if (profile && !isLoading) {
    navigate(getDefaultRoute(profile.role), { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);
    if (result.error) setError(result.error);
  };

  const createUserViaAdmin = async (svcKey: string, user: typeof DEMOS[0]) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': svcKey,
        'Authorization': `Bearer ${svcKey}`,
      },
      body: JSON.stringify({
        email: user.email,
        password: 'demo123',
        email_confirm: true,
        user_metadata: { first_name: user.firstName, last_name: user.lastName, role: user.role },
      }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.msg || body.error || `HTTP ${res.status}`);
    return body;
  };

  const runSetup = async () => {
    setSetupLoading(true);
    setError('');

    for (const d of DEMOS) {
      try {
        const authUser = await createUserViaAdmin(svcKey, d);
        await supabase.from('users').insert({
          id: authUser.id,
          email: d.email,
          first_name: d.firstName,
          last_name: d.lastName,
          role: d.role,
          status: 'active',
          email_verified: true,
        });
        if (d.role === 'student') {
          await supabase.from('students').insert({ id: authUser.id, student_type: 'regular', registration_number: `STU-DEMO-${authUser.id.slice(0, 8)}` });
        } else if (d.role === 'teacher') {
          await supabase.from('teachers').insert({ id: authUser.id });
        } else if (d.role === 'assistant') {
          await supabase.from('assistants').insert({ id: authUser.id });
        }
      } catch (e: any) {
        if (!e.message?.includes('already')) {
          setError(`Erreur sur ${d.email}: ${e.message}`);
          setSetupLoading(false);
          setSetupDone(false);
          return;
        }
      }
    }

    setSetupDone(true);
    setSetupLoading(false);
    setShowSetup(false);
    setError('✅ 4 comptes démo créés avec succès !');
  };

  const demoLogin = async (d: typeof DEMOS[0]) => {
    setDemoLoading(d.role);
    setError('');

    const r = await signIn(d.email, 'demo123');
    if (!r.error) { setDemoLoading(null); return; }

    const up = await signUp(d.email, 'demo123', d.firstName, d.lastName, d.role as 'admin' | 'assistant' | 'teacher' | 'student' | 'parent');
    if (up.error) {
      const e = up.error.toLowerCase();
      if (e.includes('already') || e.includes('exists') || e.includes('registered')) {
        await signIn(d.email, 'demo123');
      } else if (e.includes('rate') || e.includes('limit')) {
        setError('Rate limit Supabase. Colle ta clé service_role pour configurer en 1 clic ⬇️');
        setShowSetup(true);
      } else {
        setError(up.error);
      }
      setDemoLoading(null);
      return;
    }

    await signIn(d.email, 'demo123');
    setDemoLoading(null);
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

        {import.meta.env.DEV && (<>
          {/* DEMO */}
          <div className="mt-6 rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--fg-muted)' }}>Connexion rapide</p>
            <div className="flex flex-wrap gap-2">
              {DEMOS.map((d) => (
                <button key={d.role} type="button" onClick={() => demoLogin(d)} disabled={demoLoading !== null}
                  className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:opacity-70 disabled:opacity-40" style={{ borderColor: 'var(--border)' }}>
                  {demoLoading === d.role ? <Loader className="inline h-4 w-4 animate-spin" /> : d.label}
                </button>
              ))}
            </div>
          </div>

          {/* SETUP */}
          {showSetup && (
            <div className="mt-4 rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
                <Key className="h-3.5 w-3.5" /> Configuration unique
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>
                Va dans Supabase → Project Settings → API → copie la <strong>service_role key</strong> et colle-la ici :
              </p>
              <input type="password" value={svcKey} onChange={(e) => setSvcKey(e.target.value)} placeholder="service_role key..." className="w-full rounded-lg border px-3 py-2 text-xs outline-none mb-3" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
              <button onClick={runSetup} disabled={setupLoading || !svcKey} className="w-full rounded-lg py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
                {setupLoading ? <Loader className="inline h-3.5 w-3.5 animate-spin" /> : 'Créer les 4 comptes démo'}
              </button>
            </div>
          )}
        </>)}

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--fg-muted)', opacity: 0.4 }}>
          Radiant Academy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
