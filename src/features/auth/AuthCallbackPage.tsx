import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Finalisation de la connexion...');

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (cancelled) return;
      if (sessionError || !session) {
        setStatus('Échec de l\'authentification. Veuillez réessayer.');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.role) {
        const rolePath: Record<string, string> = {
          student: '/student/dashboard',
          parent: '/parent/dashboard',
          teacher: '/teacher/dashboard',
          assistant: '/assistant/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(rolePath[profile.role] || '/', { replace: true });
      } else {
        navigate('/auth/complete-profile', { replace: true });
      }
    });

    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{status}</p>
      </div>
    </div>
  );
}
