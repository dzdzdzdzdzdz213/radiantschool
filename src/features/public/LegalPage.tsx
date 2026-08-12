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
    <div className="relative min-h-screen w-full bg-black">
      <div className="fixed inset-0">
        <img src={asset('images/dz.webp')} alt="Radiant Academy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <Link to="/" className="inline-flex w-fit items-center gap-1.5 text-sm text-white/85 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
          {content.icon} Radiant Academy
        </div>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-4xl">{content.title}</h1>
        <p className="mt-2 text-sm text-white/75 sm:text-base">{content.tagline}</p>

        <div className="mt-8 grid flex-1 content-start gap-4">
          {content.sections.map((s) => (
            <div key={s.h2} className="rounded-2xl border border-white/10 p-5">
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full" style={{ background: 'var(--primary)' }} />
                <h2 className="font-display text-lg font-semibold tracking-tight text-white drop-shadow">{s.h2}</h2>
              </div>
              <p className="text-sm leading-relaxed text-white/80 drop-shadow">{s.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-5 sm:flex-row">
          <p className="text-xs text-white/60">Radiant Academy &copy; {new Date().getFullYear()} — {t('footer.rights', lang)}</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="text-xs text-white/70 transition-colors hover:text-white">Mentions légales</Link>
            <Link to="/cgv" className="text-xs text-white/70 transition-colors hover:text-white">CGV</Link>
            <Link to="/confidentialite" className="text-xs text-white/70 transition-colors hover:text-white">Confidentialité</Link>
          </div>
        </div>
      </div>
    </div>
  );
}