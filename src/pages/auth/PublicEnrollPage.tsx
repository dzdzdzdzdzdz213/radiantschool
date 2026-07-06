import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRoute } from '@/lib/permissions';
import RegisterPage from './RegisterPage';
import { Loader } from 'lucide-react';

export default function PublicEnrollPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (profile) {
    if (profile.role === 'student') return <Navigate to="/student/enroll" replace />;
    if (profile.role === 'parent') return <Navigate to="/parent/enroll" replace />;
    return <Navigate to={getDefaultRoute(profile.role)} replace />;
  }

  return <RegisterPage />;
}
