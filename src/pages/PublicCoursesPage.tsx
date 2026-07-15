import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicCourses } from '@/hooks/usePublicData';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen, BookText, Building2, GraduationCap, ArrowLeft, Search, Star, UserPlus } from 'lucide-react';
import { getCourseImageUrl } from '@/lib/storage';

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
  const [selStream, setSelStream] = useState<{ year: string; stream: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [search, setSearch] = useState('');

  const allCourses = courses ?? [];
  const filteredByCat = cat === 'all' ? allCourses : allCourses.filter((c: any) => c.level?.category === cat);
  const streamFiltered = selStream
    ? filteredByCat.filter((c: any) => c.level?.name === selStream.year && c.level?.stream === selStream.stream)
    : filteredByCat;
  const typeFiltered = typeFilter === 'all' ? streamFiltered : streamFiltered.filter((c: any) => c.type === typeFilter);
  const filteredCourses = search
    ? typeFiltered.filter((c: any) =>
        [c.name, c.subject?.name, c.level?.name, c.level?.stream, c.teacher?.first_name, c.teacher?.last_name]
          .filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
      )
    : typeFiltered;

  const streamsByYear: { year: string; streams: string[] }[] = [];
  for (const c of filteredByCat) {
    const year = c.level?.name;
    const stream = c.level?.stream;
    if (!year || !stream) continue;
    let group = streamsByYear.find(g => g.year === year);
    if (!group) { group = { year, streams: [] }; streamsByYear.push(group); }
    if (!group.streams.includes(stream)) group.streams.push(stream);
  }
  streamsByYear.sort((a, b) => a.year.localeCompare(b.year));
  for (const g of streamsByYear) g.streams.sort();

  return (
    <div className="min-h-screen relative" style={{ color: 'var(--fg)' }}>
      {/* Background handled globally by AnimatedBackground */}
      <div className="mx-auto max-w-7xl px-6 py-12 relative">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mb-12 text-center" data-reveal>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('section.formations.title', lang)}</h1>
          <div className="divider-gradient mt-5 mx-auto" />
          <p className="mx-auto mt-5 max-w-xl" style={{ color: 'var(--fg-muted)' }}>{t('section.formations.subtitle', lang)}</p>
        </div>

        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="flex justify-center gap-3">
            {categories.map(c => (
              <button key={c.key} onClick={() => { setCat(c.key); setSelStream(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${cat === c.key ? 'text-white shadow-lg scale-105' : 'hover:scale-105'}`}
                style={cat === c.key ? { background: c.btnGradient } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            ))}
          </div>

          {streamsByYear.length > 0 && (
            <div className="flex flex-col items-center gap-5 w-full max-w-3xl">
              <button onClick={() => setSelStream(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${!selStream ? 'text-white' : 'hover:scale-105'}`}
                style={!selStream ? { background: 'var(--primary)' } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >Toutes les filières</button>
              {streamsByYear.map(g => (
                <div key={g.year} className="w-full">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2.5 text-center" style={{ color: 'var(--fg-muted)' }}>{g.year}</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {g.streams.map(s => {
                      const active = selStream?.year === g.year && selStream?.stream === s;
                      return (
                        <button key={s} onClick={() => setSelStream(active ? null : { year: g.year, stream: s })}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${active ? 'text-white' : 'hover:scale-105'}`}
                          style={active ? { background: 'var(--primary)' } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2">
            {(['all', 'normal', 'vip'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${typeFilter === t ? 'text-white' : 'hover:scale-105'}`}
                style={typeFilter === t ? { background: 'var(--primary)' } : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >{t === 'all' ? 'Tous les types' : t === 'vip' ? 'VIP' : 'Normal'}</button>
            ))}
          </div>

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
          <div className="text-center py-24 animate-up" style={{ color: 'var(--fg-muted)' }}>
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl mb-6" style={{ backgroundColor: 'var(--primary-light)' }}>
              <GraduationCap className="h-12 w-12" style={{ color: 'var(--primary)' }} />
            </div>
            <p className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>Aucune formation trouvée</p>
            <p className="text-sm max-w-xs mx-auto">Essayez de modifier vos filtres ou votre recherche</p>
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
            const isVip = c.type === 'vip';
            return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                {c.image_url && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 -mx-1 -mt-1">
                    <img src={getCourseImageUrl(c.image_url) || ''} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: 'var(--fg-muted)' }}>{c.subject?.name ?? ''}</p>
                      {isVip && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                          <Star className="h-2.5 w-2.5" />VIP
                        </span>
                      )}
                    </div>
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
                  {c.capacity && <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{c.current_enrollments ?? 0}/{isVip ? '6' : c.capacity} places</span>}
                </div>
                <div className="flex gap-2">
                  {!isVip && (
                    <Link to="/enroll"
                      className="flex-1 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                      style={{ background: catInfo.btnGradient }}
                    >S'inscrire</Link>
                  )}
                  {isVip && (
                    <Link to="/enroll"
                      className="flex-1 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                    >Réserver VIP</Link>
                  )}
                  {c.teacher?.accepts_private_lessons !== false && (
                    <Link to={`/private-request/${c.id}`}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
                      style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)`, color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}
                    ><UserPlus className="h-3.5 w-3.5" />Particulier</Link>
                  )}
                </div>
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
