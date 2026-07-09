import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const PAGES: Record<string, { title: string; sections: { h2: string; p: string }[] }> = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        h2: 'Éditeur du site',
        p: 'Radiant Academy — Centre de soutien scolaire et de formation. Alger, Algérie.',
      },
      {
        h2: 'Hébergement',
        p: 'Hébergé par Vercel et Supabase.',
      },
      {
        h2: 'Propriété intellectuelle',
        p: 'Tous les contenus de ce site sont la propriété de Radiant Academy.',
      },
    ],
  },
  cgv: {
    title: 'Conditions générales de vente',
    sections: [
      {
        h2: 'Inscription',
        p: 'L\'inscription est validée après paiement. Une confirmation est envoyée par email.',
      },
      {
        h2: 'Tarifs',
        p: 'Les tarifs sont indiqués en DZD toutes taxes comprises.',
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        h2: 'Données collectées',
        p: 'Nous collectons les informations nécessaires à la gestion des inscriptions et au suivi pédagogique.',
      },
      {
        h2: 'Contact',
        p: 'Pour toute question, contactez-nous par email.',
      },
    ],
  },
};

export default function LegalPage() {
  const { lang } = useLang();
  const { page } = useParams<{ page: string }>();
  const content = page ? PAGES[page] : null;

  if (!content) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 bg-background">
        <h1 className="text-2xl font-bold text-foreground">{t('common.not_found', lang)}</h1>
        <Link to="/" className="text-sm text-primary">Accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-10 text-foreground">{content.title}</h1>

        <div className="space-y-8">
          {content.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-2 text-foreground">{s.h2}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}