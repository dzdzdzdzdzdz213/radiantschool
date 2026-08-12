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
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8">
        <Link to="/" className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
        </Link>

        <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {content.icon} Radiant Academy
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-4xl">{content.title}</h1>
        <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-base">{content.tagline}</p>

        <div className="mt-6 grid flex-1 content-start gap-3">
          {content.sections.map((s) => (
            <div key={s.h2} className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur-[2px]">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full" style={{ background: 'var(--primary)' }} />
                <h2 className="font-display text-base font-semibold tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-lg">{s.h2}</h2>
              </div>
              <p className="text-xs leading-relaxed text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-sm">{s.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-4 sm:flex-row">
          <p className="text-[11px] text-white/80">Radiant Academy &copy; {new Date().getFullYear()} — {t('footer.rights', lang)}</p>
          <div className="flex gap-3">
            <Link to="/mentions-legales" className="rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50">Mentions légales</Link>
            <Link to="/cgv" className="rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50">CGV</Link>
            <Link to="/confidentialite" className="rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50">Confidentialité</Link>
          </div>
        </div>
      </div>
    </div>
  );
}