import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole, UserProfile } from '@/types/models';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function RedirectEffect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace: true }); }, [navigate, to]);
  return null;
}

function InactiveAccount({ profile }: { profile: UserProfile }) {
  const { signOut } = useAuth();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-4xl">🔒</div>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>Compte non actif</h2>
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
        {profile.status === 'pending'
          ? "Votre compte est en attente de validation par l'administration."
          : "Votre compte a été désactivé. Veuillez contacter l'administration."}
      </p>
      <button
        onClick={signOut}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        Retour à la connexion
      </button>
    </div>
  );
}

/**
 * Route guard that renders children only when:
 * - User is authenticated
 * - Profile status is `active`
 * - User's role is in `allowedRoles`
 *
 * Otherwise redirects to `/login`, shows an inactive-account page,
 * or redirects to the user's own role dashboard.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <RedirectEffect to="/login" />;
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile.status !== 'active') {
    return <InactiveAccount profile={profile} />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <RedirectEffect to={`/${profile.role}/dashboard`} />;
  }

  return <>{children}</>;
}
