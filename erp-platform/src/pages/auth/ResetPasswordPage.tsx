import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else { setDone(true); setTimeout(() => navigate('/login'), 2000); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">Nouveau mot de passe</h1>
        {done ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <p className="text-green-600 font-medium">Mot de passe mis à jour!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-8 shadow-sm">
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" minLength={6} required />
            </div>
            <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90">Réinitialiser</button>
          </form>
        )}
      </div>
    </div>
  );
}
