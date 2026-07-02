import { useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SafeRedirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { startTransition(() => { navigate(to, { replace: true }); }); }, [navigate, to]);
  return null;
}
