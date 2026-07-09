import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-background">
      <h1 className="text-6xl font-bold" style={{ color: 'var(--primary)' }}>404</h1>
      <p className="text-lg text-muted-foreground">Page introuvable</p>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--primary)' }}>
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>
    </div>
  );
}
