import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, label = 'Retour' }: { to?: string; label?: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97]"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
      }}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
