import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Finalisation de la connexion...');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase.from('users').select('id, role, status').eq('id', session.user.id).single();

      if (profile) {
        const role = profile.role;
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'parent') navigate('/parent/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else if (role === 'assistant') navigate('/assistant/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      } else {
        navigate('/complete-profile');
      }
    }).catch(() => navigate('/login'));
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
