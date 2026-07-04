import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Renders nothing and navigates to the specified path via `useNavigate`.
 * Safe to use inside a router context for layout-level redirects.
 */
export default function SafeRedirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace: true }); }, [navigate, to]);
  return null;
}
