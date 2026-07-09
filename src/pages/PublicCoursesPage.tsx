import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicCourses } from '@/hooks/usePublicData';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen, BookText, Building2, GraduationCap, ArrowLeft, Search } from 'lucide-react';

const categories = [
  { key: 'all', label: 'Tous', icon: BookOpen, btnGradient: 'linear-gradient(135deg, var(--primary), var(--accent))' },
  { key: 'primary', label: 'Primaire', icon: BookText, btnGradient: 'linear-gradient(135deg, #059669, #0d9488)' },
  { key: 'middle', label: 'CEM', icon: Building2, btnGradient: 'linear-gradient(135deg, #ea580c, #e11d48)' },
  { key: 'high_school', label: 'Lycée', icon: GraduationCap, btnGradient: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
] as const;

export default function PublicCoursesPage() {
  const { lang } = useLang();
  const { data: courses, isLoading } = usePublicCourses();
  const [cat, setCat] = useState<'all' | 'primary' | 'middle' | 'high_school'>('all');
  const [streamFilter, setStreamFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allCourses = courses ?? [];
  const filteredByCat = cat === 'all' ? allCourses : allCourses.filter((c: any) => c.level?.category === cat);
  const availableStreams = [...new Set(filteredByCat.map((c: any) => c.level?.stream).filter(Boolean))] as string[];
  const streamFiltered = streamFilter ? filteredByCat.filter((c: any) => c.level?.stream === streamFilter) : filteredByCat;
  const filteredCourses = search
    ? streamFiltered.filter((c: any) =>
        [c.name, c.subject?.name, c.level?.name, c.level?.stream, c.teacher?.first_name, c.teacher?.last_name]
          .filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
      )
    : streamFiltered;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('section.formations.title', lang)}</h1>
          <div className="divider-gradient mt-5 mx-auto" />
          <p className="mx-auto mt-5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>{t('section.formations.subtitle', lang)}</p>
        </div>

        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="flex justify-center gap-3">
            {categories.map(c => (
              <button key={c.key} onClick={() => { setCat(c.key); setStreamFilter(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${cat === c.key ? 'text-white shadow-lg scale-105' : 'hover:scale-105'}`}
                style={cat === c.key ? { background: c.btnGradient } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            ))}
          </div>

          {availableStreams.length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap">
              <button onClick={() => setStreamFilter(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${!streamFilter ? 'text-white' : 'hover:scale-105'}`}
                style={!streamFilter ? { background: 'var(--primary)' } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >Toutes les filières</button>
              {availableStreams.map(s => (
                <button key={s} onClick={() => setStreamFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${streamFilter === s ? 'text-white' : 'hover:scale-105'}`}
                  style={streamFilter === s ? { background: 'var(--primary)' } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >{s}</button>
              ))}
            </div>
          )}

          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              className="w-full h-11 rounded-xl pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg)', caretColor: 'var(--primary)' }}
            />
          </div>
        </div>

        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-24" style={{ color: 'var(--fg-muted)' }}>
            <GraduationCap className="h-20 w-20 mx-auto mb-5 opacity-30" />
            <p className="text-xl font-medium mb-2">Aucune formation trouvée</p>
            <p className="text-sm">Essayez de modifier vos filtres ou votre recherche</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="h-4 w-20 rounded-md mb-3" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-5 w-40 rounded-md mb-3" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-4 w-full rounded-md mb-2" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-4 w-3/4 rounded-md mb-6" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-10 w-full rounded-xl" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          ))}
          {filteredCourses.map((c: any) => {
            const catInfo = categories.find(x => x.key === (c.level?.category ?? 'all')) ?? categories[0];
            const CIcon = catInfo.icon;
            return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: 'var(--fg-muted)' }}>{c.subject?.name ?? ''}</p>
                    <h3 className="text-lg font-bold mt-0.5 truncate">{c.name}</h3>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)` }}>
                    <CIcon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                  {c.level?.name && <span className="font-medium">{c.level.name}</span>}
                  {c.level?.stream && <span>{c.level.stream}</span>}
                  {c.teacher && <span>{c.teacher.first_name} {c.teacher.last_name}</span>}
                </div>
                <div className="flex items-center justify-between mb-4">
                  {c.price && <span className="text-lg font-bold">{Number(c.price).toLocaleString()} DA</span>}
                  {c.capacity && <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{c.current_enrollments ?? 0}/{c.capacity} places</span>}
                </div>
                <Link
                  to="/enroll"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                  style={{ background: catInfo.btnGradient }}
                >
                  S'inscrire
                </Link>
              </div>
            </motion.div>
            );
          })}
        </div>

        {!isLoading && filteredCourses.length > 0 && (
          <p className="text-center text-sm mt-10" style={{ color: 'var(--fg-muted)' }}>
            {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} trouvée{filteredCourses.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
