import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SafeRedirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace: true }); }, [navigate, to]);
  return null;
}
