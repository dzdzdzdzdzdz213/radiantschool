import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { t, getDir } from '@/i18n';
import { asset } from '@/lib/assets';

export default function BrandHero({ name, subtitle }: { name: string; subtitle?: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dir = getDir(lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border"
    >
      <img
        src={asset('alex-hero.jpg')}
        alt="Radiant Learning"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" dir={dir === 'rtl' ? 'rtl' : 'ltr'} />
      <div className="relative flex min-h-[180px] items-center p-6 sm:min-h-[220px] sm:p-8">
        <div className="max-w-xl" style={{ direction: dir }}>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">{today}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t('dashboard.greeting', lang, name)}
          </h1>
          {subtitle && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <Sparkles className="h-4 w-4 shrink-0" />
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}