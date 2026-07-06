import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePublicCourses, usePublicStats } from '@/hooks/usePublicData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { t, LANGUAGES } from '@/i18n';
import { formatCurrency } from '@/lib/utils';
import { Menu, X, Sun, Moon, Globe, ArrowRight, BookOpen, Users, GraduationCap, Sparkles, ChevronRight, Star, Award, Shield, MapPin, Phone, Mail, BarChart3, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function CountUp({ end = 0 }: { end?: number }) {
  const [c, setC] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let val = 0;
      const step = Math.ceil(end / 60);
      timer = setInterval(() => {
        val += step;
        if (val >= end) { setC(end); clearInterval(timer); } else setC(val);
      }, 20);
      obs.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => {
      obs.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [end]);
  return <span ref={ref}>{c}</span>;
}

const NAV = [
  { href: '#courses', key: 'nav.formations' },
  { href: '#why', key: 'nav.pourquoi' },
  { href: '#contact', key: 'nav.contact' },
];

export default function LandingPage() {
  const { toast } = useToast();
  const { data: courses, isLoading, isError: coursesError } = usePublicCourses();
  const { data: stats, isError: statsError } = usePublicStats();

  useEffect(() => {
    if (coursesError) toast('Erreur de chargement des formations', 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesError]);
  useEffect(() => {
    if (statsError) toast('Erreur de chargement des statistiques', 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsError]);

  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Hierarchical filter state
  const [catFilter, setCatFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(0);
  const [streamFilter, setStreamFilter] = useState('');

  type StreamOpt = { value: string; label: string };

  const STREAMS_BY_YEAR: Record<number, StreamOpt[]> = {
    1: [
      { value: 'Scientifique', label: 'Scientifique' },
      { value: 'Lettres', label: 'Lettres' },
    ],
    2: [
      { value: 'Scientifique', label: 'Scientifique' },
      { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Maths Techniques', label: 'Maths Techniques' },
    { value: 'Lettres', label: 'Lettres' },
    { value: 'Gestion et Économie', label: 'Gestion et Économie' },
  ],
  3: [
    { value: 'Scientifique', label: 'Scientifique' },
    { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Lettres', label: 'Lettres' },
    { value: 'Gestion et Économie', label: 'Gestion et Économie' },
    { value: 'Baccalauréat', label: 'BAC Toutes Sections' },
  ],
  };

  const CATEGORIES = [
    { value: '', label: 'Tous' },
    { value: 'primary', label: 'Primaire' },
    { value: 'middle', label: 'CEM' },
    { value: 'high_school', label: 'Lycée' },
  ];

  const YEAR_OPTIONS: Record<string, { value: number; label: string }[]> = {
    middle: [
      { value: 0, label: 'Tous' },
      { value: 1, label: '1ère AM' },
      { value: 2, label: '2ème AM' },
      { value: 3, label: '3ème AM' },
      { value: 4, label: '4ème AM' },
      { value: -1, label: 'BEM' },
    ],
    high_school: [
      { value: 0, label: 'Tous' },
      { value: 1, label: '1ère AS' },
      { value: 2, label: '2ème AS' },
      { value: 3, label: '3ème AS' },
    ],
  };

  const activeStreams = catFilter === 'high_school' && yearFilter > 0 ? STREAMS_BY_YEAR[yearFilter] ?? [] : [];
  function resetSubFilters() {
    setYearFilter(0);
    setStreamFilter('');
  }

  const filtered = (courses ?? []).filter((c: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.subject?.name?.toLowerCase().includes(q);
    const matchCat = !catFilter || c.level?.category === catFilter;
    const matchYear = !yearFilter
      || (yearFilter === -1 ? c.level?.name?.includes('4AM') || c.level?.name?.includes('BEM') : c.level?.year === yearFilter);
  const matchStream = !streamFilter || c.level?.stream === streamFilter;
  return matchSearch && matchCat && matchYear && matchStream;
  });

  const grouped = catFilter ? null : (() => {
    const groups: Record<string, any[]> = {};
    for (const c of filtered) {
      const cat = c.level?.category || 'autres';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return groups;
  })();

  const teacherCount = new Set((courses ?? []).map((c: any) => c.teacher?.id)).size;
  const levelCount = new Set((courses ?? []).map((c: any) => c.level?.name)).size;

  function CourseCard({ c, i }: { c: any; i: number }) {
    return (
      <div
        className="group relative rounded-xl overflow-hidden animate-up"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', animationDelay: `${i * 0.04}s`, boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="h-1" style={{ background: c.type === 'vip' ? 'linear-gradient(90deg,#f59e0b,#d97706)' : c.type === 'private' ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,var(--primary),color-mix(in srgb,var(--primary) 60%,#fff))' }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg leading-snug group-hover:text-[var(--primary)] transition-colors duration-200">{c.name}</h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>{c.subject?.name}</p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-lg ml-3 uppercase tracking-wider" style={{
              backgroundColor: c.type === 'vip' ? 'rgba(245,158,11,0.1)' : c.type === 'private' ? 'rgba(139,92,246,0.1)' : 'color-mix(in srgb, var(--primary) 10%, transparent)',
              color: c.type === 'vip' ? '#d97706' : c.type === 'private' ? '#7c3aed' : 'var(--primary)',
            }}>
              {c.type === 'vip' ? t('type.vip', lang) : c.type === 'private' ? t('type.private', lang) : t('type.group', lang)}
            </span>
          </div>
          <div className="space-y-2.5 text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                <GraduationCap className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
              </div>
              <span className="truncate">{c.level?.name}{c.level?.stream ? ` — ${c.level.stream}` : ''}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                <Users className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
              </div>
              <span className="truncate">{c.teacher?.first_name} {c.teacher?.last_name}</span>
            </div>
            {c.schedules?.[0] && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span className="truncate">{['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][c.schedules[0].day_of_week]} {c.schedules[0].start_time?.slice(0,5)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(c.price)}</p>
              {c.capacity && <p className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>{c.current_enrollments ?? 0}/{c.capacity} places</p>}
            </div>
            <Link to="/enroll" className="btn-primary px-4 py-2 text-xs gap-1.5 transition-all duration-200 hover:shadow-md hover:shadow-[var(--primary)]/20">
              {t('section.formations.jeveux', lang)} <ChevronRight className="h-3.5 w-3.5 rtl-flip" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      {/* HEADER */}
      <header className="glass-header fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo-transparent.webp" alt="Radiant Academy" className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" style={{ color: 'var(--fg-muted)' }}>
            {NAV.map((x) => (
              x.href.startsWith('/') ? (
                <Link key={x.href} to={x.href} className="hover-underline text-sm font-medium">{t(x.key, lang)}</Link>
              ) : (
                <a key={x.href} href={x.href} className="hover-underline text-sm font-medium">{t(x.key, lang)}</a>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setLangOpen(!langOpen)} className="relative hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-[var(--primary-light)]" style={{ color: 'var(--fg-muted)' }}>
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-52 top-14 z-20 w-40 overflow-hidden rounded-xl border shadow-lg animate-scale" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 hover:bg-[var(--primary-light)]" style={{ color: lang === l.code ? 'var(--primary)' : 'var(--fg)', fontWeight: lang === l.code ? 600 : 400 }}>
                      <span className="text-base">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={toggle} className="rounded-xl p-2.5 transition-all duration-200 hover:bg-[var(--primary-light)]" style={{ color: 'var(--fg-muted)' }}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>



            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2.5 md:hidden transition-all duration-200 hover:bg-[var(--primary-light)]" style={{ color: 'var(--fg-muted)' }}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t px-6 pb-8 pt-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <nav className="mb-6 flex flex-col gap-4 text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              {NAV.map((x) => (
                x.href.startsWith('/') ? (
                  <Link key={x.href} to={x.href} onClick={() => setMenuOpen(false)} className="transition-colors duration-200 hover:text-[var(--fg)]">{t(x.key, lang)}</Link>
                ) : (
                  <a key={x.href} href={x.href} onClick={() => setMenuOpen(false)} className="transition-colors duration-200 hover:text-[var(--fg)]">{t(x.key, lang)}</a>
                )
              ))}
            </nav>

          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 55% at 20% 45%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%), radial-gradient(ellipse 50% 45% at 80% 35%, color-mix(in srgb, #a78bfa 8%, transparent), transparent 70%), radial-gradient(ellipse 40% 40% at 50% 80%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 60%)` }} />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-16 w-full relative">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-center lg:text-left max-w-xl">
              <div className="badge mb-8 inline-flex animate-up gap-2 rounded-full shadow-sm" style={{ animationDelay: '0s', boxShadow: '0 1px 6px color-mix(in srgb, var(--primary) 10%, transparent)' }}>
                <Sparkles className="h-3.5 w-3.5" />
                {t('hero.badge', lang)}
              </div>

              <h1 className="animate-up" style={{ animationDelay: '0.05s' }}>
                <span className="block text-base sm:text-lg font-medium tracking-wider mb-3 uppercase" style={{ color: 'var(--fg-muted)', letterSpacing: '0.15em' }}>{t('hero.title1', lang)}</span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.88] tracking-tighter text-gradient">{t('hero.title2', lang)}</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed animate-up max-w-md mx-auto lg:mx-0" style={{ color: 'var(--fg-muted)', animationDelay: '0.1s' }}>
                {t('hero.subtitle', lang)}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-up" style={{ animationDelay: '0.15s' }}>
                <a href="#courses" className="btn-primary h-14 px-10 text-base gap-2.5 w-full sm:w-auto shadow-2xl shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-[0.97]">
                  {t('hero.cta1', lang)} <ArrowRight className="h-4 w-4 rtl-flip" />
                </a>
                <Link to="/enroll" className="btn-ghost h-14 px-10 text-base w-full sm:w-auto">
                  {t('hero.cta2', lang)}
                </Link>
              </div>

              <div className="mt-16 animate-up" style={{ animationDelay: '0.2s' }}>
                <div className="inline-flex items-stretch rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                  {[
                    { icon: BookOpen, value: courses?.length ?? 0, key: 'stat.formations' },
                    { icon: GraduationCap, value: stats?.levelCount ?? levelCount, key: 'stat.niveaux' },
                    { icon: Users, value: teacherCount, key: 'stat.professeurs' },
                  ].map((s, i, arr) => (
                    <div key={s.key} className="flex items-center gap-3.5 px-8 py-5" style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)` }}>
                        <s.icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-black leading-none mb-0.5" style={{ color: 'var(--primary)' }}><CountUp end={s.value} /></p>
                        <p className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>{t(s.key, lang)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end animate-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative w-80 sm:w-[28rem] h-80 sm:h-[28rem]">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-40" style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent), transparent)` }} />
                <div className="absolute bottom-6 left-4 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(circle, color-mix(in srgb, #a78bfa 25%, transparent), transparent)` }} />
                <div className="absolute -top-4 -left-4 w-28 h-28 rounded-2xl rotate-12 opacity-20" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 15%, transparent)` }} />
                <div className="absolute -bottom-3 right-4 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: `color-mix(in srgb, var(--accent) 15%, transparent)` }} />
                <div className="absolute top-1/4 -right-3 w-16 h-16 rounded-xl rotate-45 opacity-15" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 20%, transparent)` }} />
                <div className="relative w-full h-full rounded-[40px] flex items-center justify-center backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 40%, transparent)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <div className="absolute inset-6 rounded-[28px] border border-dashed" style={{ borderColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }} />
                  <img src="/logo-transparent.webp" alt="Radiant Academy" className="w-56 sm:w-72 h-auto relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="scroll-mt-20 py-28 px-6" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="badge inline-flex mb-5">{t('section.formations.badge', lang)}</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('section.formations.title', lang)}</h2>
            <div className="divider-gradient mt-5" />
            <p className="mt-5 max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>{t('section.formations.subtitle', lang)}</p>
            <div className="max-w-md mx-auto mt-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)', opacity: 0.5 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('section.formations.search', lang)}
                className="w-full rounded-xl border pl-11 pr-5 py-3.5 text-sm outline-none transition-all duration-200"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCatFilter(c.value); resetSubFilters(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: catFilter === c.value ? 'var(--primary)' : 'var(--bg)',
                  color: catFilter === c.value ? '#fff' : 'var(--fg-muted)',
                  border: catFilter === c.value ? 'none' : '1px solid var(--border)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Year filter chips (CEM / Lycée) */}
          {catFilter && YEAR_OPTIONS[catFilter] && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: 'var(--fg-muted)' }}>
                <ChevronDown className="h-3 w-3 inline mr-1" />Année
              </span>
              {YEAR_OPTIONS[catFilter].map((y) => (
                <button
                  key={y.value}
                  onClick={() => { setYearFilter(y.value); setStreamFilter(''); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: yearFilter === y.value ? 'var(--primary)' : 'var(--bg)',
                    color: yearFilter === y.value ? '#fff' : 'var(--fg-muted)',
                    border: yearFilter === y.value ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {y.label}
                </button>
              ))}
            </div>
          )}

          {/* Stream filter chips (Lycée only) */}
          {activeStreams.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: 'var(--fg-muted)' }}>
                <ChevronDown className="h-3 w-3 inline mr-1" />Filière
              </span>
              {activeStreams.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setStreamFilter(streamFilter === s.value ? '' : s.value); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: streamFilter === s.value ? 'var(--primary)' : 'var(--bg)',
                    color: streamFilter === s.value ? '#fff' : 'var(--fg-muted)',
                    border: streamFilter === s.value ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Active filter summary + reset */}
          {catFilter && (
            <div className="flex items-center justify-center gap-3 mb-10">
              {[catFilter && CATEGORIES.find(c => c.value === catFilter)?.label,
                yearFilter > 0 && YEAR_OPTIONS[catFilter]?.find(y => y.value === yearFilter)?.label,
                streamFilter,
              ].filter(Boolean).join(' › ') && (
                <span className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>
                  {[catFilter && CATEGORIES.find(c => c.value === catFilter)?.label,
                    yearFilter > 0 && YEAR_OPTIONS[catFilter]?.find(y => y.value === yearFilter)?.label,
                    streamFilter,
                  ].filter(Boolean).join(' › ')}
                </span>
              )}
              <button
                onClick={() => { setCatFilter(''); resetSubFilters(); }}
                className="text-xs font-semibold underline underline-offset-4 transition-colors"
                style={{ color: 'var(--fg-muted)' }}
              >
                Réinitialiser
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl" style={{ backgroundColor: 'var(--bg)', animation: 'shimmer 2s infinite linear', backgroundImage: 'linear-gradient(90deg, var(--bg) 25%, var(--bg-card) 50%, var(--bg) 75%)', backgroundSize: '200% 100%' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                <Search className="h-7 w-7" style={{ color: 'var(--primary)', opacity: 0.5 }} />
              </div>
              <p className="text-lg font-semibold mb-1">{t('section.formations.empty', lang)}</p>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Essaie un autre mot-clé</p>
              <button onClick={() => { setSearch(''); setCatFilter(''); resetSubFilters(); }} className="btn-ghost mt-6 px-5 py-2.5 text-sm">
                Réinitialiser la recherche
              </button>
            </div>
          ) : grouped ? (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-14 last:mb-0">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 10%, transparent)` }}>
                    <GraduationCap className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {cat === 'primary' ? 'Primaire' : cat === 'middle' ? 'CEM / Collège' : cat === 'high_school' ? 'Lycée' : 'Autres'}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)`, color: 'var(--fg-muted)' }}>{items.length}</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((c: any, i: number) => (
                    <CourseCard key={c.id} c={c} i={i} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c: any, i: number) => (
                <CourseCard key={c.id} c={c} i={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="scroll-mt-20 py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 50% 40% at 50% 0%, color-mix(in srgb, var(--primary) 4%, transparent), transparent)` }} />
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <div className="badge inline-flex mb-5">{t('section.pourquoi.badge', lang)}</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('section.pourquoi.title', lang)}</h2>
            <div className="divider-gradient mt-5" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, key: 'feat.groups', desc: 'feat.groups.desc', getStat: () => `${stats?.minCapacity ?? '—'}`, statLabel: 'élèves max', gradient: 'from-indigo-500/20 to-purple-600/20', iconColor: 'var(--primary)' },
              { icon: Star, key: 'feat.teachers', desc: 'feat.teachers.desc', getStat: () => `${stats?.teacherCount ?? '—'}+`, statLabel: 'profs', gradient: 'from-amber-500/20 to-orange-600/20', iconColor: '#f59e0b' },
              { icon: BarChart3, key: 'feat.followup', desc: 'feat.followup.desc', getStat: () => `${stats?.totalEvaluations ?? '—'}`, statLabel: 'évaluations', gradient: 'from-teal-500/20 to-cyan-600/20', iconColor: 'var(--accent)' },
              { icon: RefreshCw, key: 'feat.flexible', desc: 'feat.flexible.desc', getStat: () => `${stats?.typeCount ?? '—'}`, statLabel: 'formules', gradient: 'from-pink-500/20 to-rose-600/20', iconColor: '#ec4899' },
            ].map((f, i) => {
              const stat = f.getStat();
              return (
              <div
                key={f.key}
                className="group relative rounded-2xl p-8 text-center animate-up transition-all duration-300 hover:-translate-y-1.5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`, boxShadow: 'var(--shadow-sm)' }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `color-mix(in srgb, ${f.iconColor} 10%, transparent)` }}>
                    <f.icon className="h-7 w-7" style={{ color: f.iconColor }} />
                  </div>
                  <p className="text-2xl font-black tracking-tight mb-0.5" style={{ color: f.iconColor }}>{stat}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--fg-muted)' }}>{f.statLabel}</p>
                  <h3 className="font-bold text-lg mb-2">{t(f.key, lang)}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{t(f.desc, lang)}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent), transparent)` }} />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent), transparent)` }} />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Star, value: (stats?.avgRating ?? 0).toFixed(1), label: 'Avis clients', sub: `${stats?.totalEvaluations ?? 0} évaluations`, color: '#f59e0b' },
              { icon: Users, value: `${stats?.studentCount ?? 0}+`, label: 'Étudiants', sub: 'Inscrits', color: 'var(--primary)' },
              { icon: Award, value: `${stats?.successRate ?? 0}%`, label: 'Réussite', sub: 'Aux examens', color: '#10b981' },
              { icon: Shield, value: `${stats?.yearsActive ?? 0}+`, label: "Années d'expérience", sub: "Dans l'éducation", color: '#6366f1' },
            ].map((s, i) => (
              <div key={i} className="group relative rounded-2xl animate-up transition-all duration-300 hover:-translate-y-1.5" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`, boxShadow: 'var(--shadow-md)' }}>
                <div className="h-1.5 rounded-t-2xl bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${s.color}, color-mix(in srgb, ${s.color} 50%, #fff))` }} />
                <div className="p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `color-mix(in srgb, ${s.color} 10%, transparent)` }}>
                    <s.icon className="h-7 w-7" style={{ color: s.color }} />
                  </div>
                  <p className="text-5xl font-black tracking-tight mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-sm font-bold mt-2">{s.label}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-36 px-6">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 55%, #000))` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, rgba(255,255,255,0.15), transparent 60%)` }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent), transparent 60%)` }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, rgba(255,255,255,0.04), transparent 60%)` }} />
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="badge inline-flex mb-8 text-white/90 border-white/20 bg-white/10 backdrop-blur-md shadow-lg" style={{ color: '#fff', boxShadow: '0 4px 20px rgba(255,255,255,0.05)' }}>{t('cta.badge', lang)}</div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02]">{t('cta.title', lang)}</h2>
          <p className="mt-6 text-white/70 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">{t('cta.subtitle', lang)}</p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/enroll" className="inline-flex h-14 items-center gap-2.5 rounded-2xl bg-white px-10 text-sm font-bold shadow-2xl transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:scale-[0.97] text-base" style={{ color: 'var(--primary)' }}>
              {t('cta.button', lang)} <ArrowRight className="h-4 w-4 rtl-flip" />
            </Link>
            <a href="#courses" className="inline-flex h-14 items-center rounded-2xl border-2 px-10 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.97] text-base" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              {t('cta.secondary', lang)}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="relative" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.03]" style={{ background: `radial-gradient(circle, var(--primary), transparent)` }} />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 relative">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-4">
              <img src="/logo-transparent.webp" alt="Radiant Academy" className="h-10 w-auto mb-5" />
              <p className="text-sm leading-relaxed max-w-xs font-medium" style={{ color: 'var(--fg)' }}>{t('footer.tagline', lang)}</p>
              <div className="mt-6 flex gap-3">
                <a href="https://www.facebook.com/radiantacademy.dz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/radiantacademy.dz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/radiantacademy-dz" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'footer.links', col: 'lg:col-span-2', items: [
                ...NAV.map(x => ({ label: t(x.key, lang), href: x.href })),
                { label: t('nav.leaderboard', lang), to: '/leaderboard' },
              ]},

              { title: 'footer.contact', col: 'lg:col-span-4', items: [
                { label: '+213 779 89 34 02', icon: Phone },
                { label: 'contact@radiant.dz', icon: Mail },
                { label: 'Bordj El Bahri, Alger', icon: MapPin },
              ]},
            ].map((section) => (
              <div key={section.title} className={section.col || ''}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--fg-muted)' }}>{t(section.title, lang)}</h3>
                <ul className="space-y-3.5" style={{ color: 'var(--fg-muted)' }}>
                  {section.items.map((item: any, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i}>
                        {item.to ? (
                          <Link to={item.to} className="inline-flex items-center gap-3 text-sm transition-all duration-200 hover:text-[var(--fg)] hover:translate-x-1">
                            {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                            {item.label}
                          </Link>
                        ) : item.href ? (
                          <a href={item.href} className="inline-flex items-center gap-3 text-sm transition-all duration-200 hover:text-[var(--fg)] hover:translate-x-1">
                            {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                            {item.label}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-3 text-sm">
                            {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                            {item.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="mt-16 rounded-2xl overflow-hidden sm:flex" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="sm:w-2/5 p-7 flex flex-col justify-center gap-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, var(--accent) 10%, transparent)` }}>
                <MapPin className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-lg font-bold">{t('dashboard.location', lang)}</p>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                  Radiant Academy<br />Bordj El Bahri, Alger<br />Algérie
                </p>
              </div>
              <a href="https://www.google.com/maps/search/Radiant+Academy+Bordj+El+Bahri+Alger/" target="_blank" rel="noopener noreferrer" className="btn-primary self-start mt-1 h-10 px-5 text-xs gap-2 rounded-xl">
                Ouvrir dans Maps <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
              </a>
            </div>
            <div className="sm:w-3/5 h-56" style={{ borderTop: '1px solid var(--border)' }}>
              <iframe
                src="https://www.google.com/maps?q=Radiant+Academy+Bordj+El+Bahri+Alger&output=embed&z=16"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                title="Radiant Academy Location"
              />
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            <p className="font-medium">Radiant Academy &copy; {new Date().getFullYear()} &mdash; {t('footer.rights', lang)}</p>
            <div className="flex gap-8">
              <span className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4 cursor-default">Mentions légales</span>
              <span className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4 cursor-default">CGV</span>
              <span className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4 cursor-default">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
