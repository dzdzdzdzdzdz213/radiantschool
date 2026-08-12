import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Lock } from 'lucide-react';
import { asset } from '@/lib/assets';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const PAGES: Record<string, { title: string; tagline: string; icon: React.ReactNode; sections: { h2: string; p: string }[] }> = {
  'mentions-legales': {
    title: 'Mentions légales',
    tagline: 'Informations légales relatives à Radiant Academy',
    icon: <ShieldCheck className="h-5 w-5" />,
    sections: [
      {
        h2: 'Éditeur du site',
        p: 'Radiant Academy — Établissement d\'excellence éducative. Alger, Algérie.',
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
    tagline: 'Les conditions qui régissent nos prestations',
    icon: <FileText className="h-5 w-5" />,
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
    tagline: 'Nous protégeons vos données personnelles',
    icon: <Lock className="h-5 w-5" />,
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
  const { pathname } = useLocation();
  const page = pathname.replace('/', '');
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
      <div className="w-full overflow-hidden">
        <img src={asset('images/dz.webp')} alt="Radiant Academy" className="h-auto w-full object-cover" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:opacity-75" style={{ color: 'var(--primary)' }}>
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {content.icon} Radiant Academy
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{content.tagline}</p>

        <div className="mt-8 space-y-5">
          {content.sections.map((s) => (
            <div key={s.h2} className="cahier-margin rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full" style={{ background: 'var(--primary)' }} />
                <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{s.h2}</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">Radiant Academy &copy; {new Date().getFullYear()} — {t('footer.rights', lang)}</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Mentions légales</Link>
            <Link to="/cgv" className="text-xs text-muted-foreground transition-colors hover:text-foreground">CGV</Link>
            <Link to="/confidentialite" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Confidentialité</Link>
          </div>
        </div>
      </div>
    </div>
  );
}