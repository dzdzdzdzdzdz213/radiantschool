import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Finalisation de la connexion...</p>
      </div>
    </div>
  );
}
