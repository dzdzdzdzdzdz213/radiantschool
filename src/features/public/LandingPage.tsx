import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePublicCourses, usePublicStats } from '@/hooks/usePublicData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { asset } from '@/lib/assets';
import { fetchPublicTeam, fetchSiteIdentity, DEFAULT_IDENTITY, type TeamMember } from '@/lib/site-content';
import { t, LANGUAGES } from '@/i18n';
import { Menu, X, Sun, Moon, Globe, ArrowRight, Users, Sparkles, Star, MapPin, Phone, Mail, BarChart3, RefreshCw, Heart, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

/*
  HUMANIZING PASS — summary of what changed vs. the original file
  ------------------------------------------------------------------
  1. New "Qui sommes-nous" section (id="about"), placed right after the
     hero and before the course catalog — you meet the people before
     the product list.
  2. One signature element: a handwritten accent font (Google Font
     "Caveat") used ONLY for signatures / sticky-note captions. It's
     the one place the design breaks from the clean sans UI, so it
     stays legible and doesn't turn into a gimmick everywhere.
  3. Hero: added a small "real parents trust us" avatar strip and a
     rotated Polaroid-style photo card next to the product shot, so
     the hero isn't just an abstract gradient blob + logo.
  4. Nav: added a "Qui sommes-nous" entry. Because the footer already
     maps over NAV, the new link appears there automatically too.
  5. Toned down the glass/blur + floating-orb decoration slightly
     (still present, just less of the "everything is a blurred
     gradient circle" template look).

  TODO for you before shipping:
  - Add a real i18n key for 'nav.apropos' in your i18n files (French/
    Arabic/English). Until then it falls back to the hardcoded label
    below so nothing breaks.
  - Swap every placeholder photo path (/team/*.webp, /images/*.webp)
    for real photos of your actual teachers/students. Placeholder
    photos are the fastest way to make a "human" section feel fake —
    real faces are what actually does the work here.
  - The founder story copy is a starting draft — rewrite it in your
    own voice/details (year founded, real name, real anecdote).
*/

const NAV = [
  { href: '/formations', key: 'nav.formations', label: undefined as string | undefined },
  { href: '#about', key: 'nav.apropos', label: 'Qui sommes-nous' },
  { href: '#why', key: 'nav.pourquoi', label: undefined as string | undefined },
  { href: '#contact', key: 'nav.contact', label: undefined as string | undefined },
];

// Placeholder team data — replaced by team_members managed in the admin CMS.
const TEAM = [
  { name: 'Amina B.', role: 'Fondatrice — Prof de Mathématiques', years: '12 ans d\'expérience', photo: asset('team/amina.webp') },
  { name: 'Yacine K.', role: 'Prof de Physique', years: '8 ans d\'expérience', photo: asset('team/yacine.webp') },
  { name: 'Sarah M.', role: 'Prof de Français', years: '6 ans d\'expérience', photo: asset('team/sarah.webp') },
  { name: 'Riad T.', role: 'Coordinateur pédagogique', years: '10 ans d\'expérience', photo: asset('team/riad.webp') },
];

function toTeamView(members: TeamMember[]): typeof TEAM {
  return members.map((m) => ({
    name: m.name,
    role: m.role,
    years: m.years || '—',
    photo: m.photo_url || asset('team/amina.webp'),
  }));
}

export default function LandingPage() {
  const { toast } = useToast();
  const { data: courses, isError: coursesError } = usePublicCourses();
  const { data: stats, isError: statsError } = usePublicStats();
  const [team, setTeam] = useState<typeof TEAM>(TEAM);
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);

  useEffect(() => {
    let active = true;
    fetchPublicTeam().then((members) => {
      if (!active) return;
      if (members.length > 0) setTeam(toTeamView(members));
    }).catch(() => {});
    fetchSiteIdentity().then((data) => { if (active) setIdentity(data); }).catch(() => {});
    return () => { active = false; };
  }, []);

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const teacherCount = new Set((courses ?? []).map((c) => c.teacher?.id)).size;

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
      <style>{`.font-handwritten { font-family: 'Caveat', cursive; }
.hero-nav { background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: none !important; }
.hero-nav a, .hero-nav button { color: #F3EAD9 !important; }
.hero-nav a:hover, .hero-nav button:hover { color: #ffffff !important; }`}</style>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(scrolled || menuOpen || langOpen) ? 'glass-header' : 'hero-nav'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <img src={asset('logo-transparent.webp')} alt="Radiant Academy" className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" style={{ color: 'var(--fg-muted)' }}>
            {NAV.map((x) => (
              x.href.startsWith('/') ? (
                <Link key={x.href} to={x.href} className="hover-underline text-sm font-medium">{x.label ?? t(x.key, lang)}</Link>
              ) : (
                <a key={x.href} href={x.href} className="hover-underline text-sm font-medium">{x.label ?? t(x.key, lang)}</a>
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

            <Link to="/login" className="hidden sm:inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)]" style={{ color: 'var(--fg-muted)' }}>
              {t('auth.sign_in', lang)}
            </Link>

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
                  <Link key={x.href} to={x.href} onClick={() => setMenuOpen(false)} className="transition-colors duration-200 hover:text-[var(--fg)]">{x.label ?? t(x.key, lang)}</Link>
                ) : (
                  <a key={x.href} href={x.href} onClick={() => setMenuOpen(false)} className="transition-colors duration-200 hover:text-[var(--fg)]">{x.label ?? t(x.key, lang)}</a>
                )
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => { setLang(l.code); setMenuOpen(false); }} className="flex items-center gap-3 text-sm" style={{ color: lang === l.code ? 'var(--primary)' : 'var(--fg-muted)', fontWeight: lang === l.code ? 600 : 400 }}>
                  <span className="text-base">{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost h-11 text-sm">
                {t('auth.sign_in', lang)}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO — Classical academic, full-bleed artwork */}
      <section
        id="home"
        className="relative min-h-svh w-full flex items-end lg:items-center overflow-hidden"
        style={{ backgroundColor: '#191008' }}
      >
        {/* Full-bleed artwork (cover, centered on the figures) */}
        <img
          src={asset('images/hero-classic.webp')}
          alt="Peinture académique classique éclairée à la flamme — deux figures savantes au centre de l'œuvre"
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />

        {/* Cinematic overlay — left darker for readability, center/right artwork stays visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(14,9,4,0.82) 0%, rgba(14,9,4,0.45) 34%, rgba(14,9,4,0.10) 60%, rgba(14,9,4,0) 78%),' +
              'linear-gradient(0deg, rgba(14,9,4,0.55) 0%, rgba(14,9,4,0.15) 30%, transparent 55%)',
          }}
        />

        {/* Content — left column, stays clear of the central figures */}
        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-7xl px-6 pb-16 pt-32 lg:py-0 lg:pb-20">
            <div className="max-w-[34rem]">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]"
              >
                <span className="inline-block h-px w-10 bg-[#D4AF37]/70" />
                Radiant Academy
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease }}
                className="font-display text-[clamp(2.2rem,5.2vw,4.4rem)] font-semibold leading-[1.1] tracking-tight text-[#F3EAD9]"
                style={{ textShadow: '0 2px 30px rgba(10,6,3,0.7)' }}
              >
                <span className="text-[#D4AF37]">«</span>{' '}{(lang === 'fr' && identity.tagline) ? identity.tagline : t('footer.tagline', lang)}{' '}<span className="text-[#D4AF37]">»</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease }}
                className="mt-10"
              >
                <Link
                  to="/formations"
                  className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-8 text-sm font-semibold text-[#F3EAD9] backdrop-blur-sm transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#191008] active:scale-[0.97]"
                >
                  Discover More
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* QUI SOMMES-NOUS */}
      <section id="about" className="scroll-mt-20 py-28 px-6 relative overflow-hidden" data-reveal style={{ backgroundColor: '#120c0a', contentVisibility: 'auto', color: 'var(--fg)', '--fg': '#f3ead9', '--fg-muted': 'rgba(243,234,217,0.65)', '--border': 'rgba(255,255,255,0.12)', '--bg-card': 'rgba(255,255,255,0.07)' } as React.CSSProperties}>
        <img
          src={asset('images/section-teacher.webp')}
          alt="Peinture classique d'un enseignant — l'équipe de Radiant Academy"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(9,7,12,0.9) 0%, rgba(9,7,12,0.66) 30%, rgba(9,7,12,0.66) 65%, rgba(9,7,12,0.94) 100%)' }}
        />
        <div className="mx-auto max-w-7xl relative">
          <div className="grid gap-16 lg:grid-cols-2 items-center mb-24">
            {/* Story */}
            <div>
              <div className="badge inline-flex mb-5 gap-2">
                <Heart className="h-3.5 w-3.5" />
                Qui sommes-nous
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-[1.05]">
                Une équipe de profs,<br />pas une plateforme
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ color: 'var(--fg-muted)' }}>
                Radiant Academy a commencé avec une salle, un tableau, et l'envie de faire le soutien scolaire autrement — sans classes surchargées où personne ne suit vraiment. Aujourd'hui on est {teacherCount > 0 ? `${teacherCount}+` : 'plusieurs'} enseignants et des centaines d'élèves, mais l'idée de départ n'a pas changé.
              </p>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: 'var(--fg-muted)' }}>
                Petits groupes, vrai suivi, et des profs qui connaissent le prénom de chaque élève. Pas de centre d'appel, pas de robot — si vous nous écrivez, c'est quelqu'un qui connaît vos enfants qui répond.
              </p>

              <div className="flex items-center gap-4 rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <img src={asset('team/founder.webp')} loading="lazy" alt="Fondatrice de Radiant Academy" className="h-16 w-16 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--bg)', boxShadow: '0 0 0 1px var(--border)' }} />
                <div>
                  <p className="font-handwritten text-3xl leading-none mb-1" style={{ color: 'var(--primary)' }}>Amina B.</p>
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Fondatrice — prof de mathématiques depuis 12 ans</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team grid */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">L'équipe qui sera avec vos enfants</h3>
              <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
                Chaque prof est recruté pour sa pédagogie autant que pour son niveau — pas juste pour un diplôme.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member, i) => (                <div
                  key={member.name}
                  className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:shadow-xl"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 0.1}s` }}
                  data-reveal
                  data-reveal-delay={`${i * 100}`}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={member.photo} loading="lazy" alt={member.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-5 text-center">
                    <p className="font-bold text-base">{member.name}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--primary)' }}>{member.role}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--fg-muted)' }}>{member.years}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORMATIONS — Premium Educational Experience */}


      {/* WHY US + STATS — one continuous space photo */}
      <section id="why" className="scroll-mt-20 py-28 px-6 relative overflow-hidden" data-reveal style={{ backgroundColor: '#080512', contentVisibility: 'auto', color: 'var(--fg)', '--fg': '#f3ead9', '--fg-muted': 'rgba(243,234,217,0.65)', '--border': 'rgba(255,255,255,0.12)', '--bg-card': 'rgba(255,255,255,0.06)' } as React.CSSProperties}>
        <img
          src={asset('images/section-space.webp')}
          alt="Nébuleuse spatiale — le cosmos comme toile de fond"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(9,7,12,0.9) 0%, rgba(9,7,12,0.6) 35%, rgba(9,7,12,0.6) 65%, rgba(9,7,12,0.92) 100%)' }}
        />
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <div className="inline-flex mb-5 gap-2 rounded-full glass px-4 py-2 text-white/80"><Sparkles className="h-3.5 w-3.5" />{t('section.pourquoi.badge', lang)}</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">{t('section.pourquoi.title', lang)}</h2>
            <div className="divider-gradient mt-5" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, key: 'feat.groups', desc: 'feat.groups.desc', getStat: () => `${stats?.maxCapacity ?? '—'}`, statLabel: 'élèves max', gradient: 'from-indigo-500/20 to-purple-600/20', iconColor: 'var(--primary)' },
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

          {/* Stats — same photo, continuous */}
          <div className="mt-24 border-t border-white/10 pt-14">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{t('section.pourquoi.title', lang)}</h2>
              <p className="mt-3 text-white/40 text-sm">Des chiffres qui parlent d'eux-mêmes</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: (stats?.avgRating ?? 0).toFixed(1), label: 'Avis', sub: `${stats?.totalEvaluations ?? 0} évaluations`, color: '#f59e0b' },
                { value: `${stats?.studentCount ?? 0}`, suffix: '+', label: 'Étudiants', sub: 'Inscrits', color: '#a855f7' },
                { value: `${stats?.successRate ?? 0}`, suffix: '%', label: 'Réussite', sub: 'Aux examens', color: '#10b981' },
                { value: `${stats?.yearsActive ?? 0}`, suffix: '+', label: "Années", sub: "D'expérience", color: '#3b82f6' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none" style={{ color: s.color }}>
                    {s.value}{s.suffix ?? ''}
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">{s.label}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — Ready to join? */}
      <section className="relative overflow-hidden py-36 px-6" style={{ backgroundColor: '#0c0704' }}>
        <img
          src={asset('images/section-alch.webp')}
          alt="Peinture d'alchimiste éclairée à la flamme — fond de la section d'inscription"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb-1 absolute top-[30%] left-[20%] w-96 h-96 rounded-full bg-white/5 blur-[40px]" />
          <div className="orb-2 absolute bottom-[30%] right-[20%] w-80 h-80 rounded-full bg-white/5 blur-[40px]" />
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-4xl text-center z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <div className="inline-flex mb-8 gap-2 rounded-full glass px-4 py-2 text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              {t('cta.badge', lang)}
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02]">{t('cta.title', lang)}</h2>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/enroll" className="group inline-flex h-14 items-center gap-2.5 rounded-2xl border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-10 text-sm font-bold text-[#F3EAD9] backdrop-blur-sm transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#191008] hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)] active:scale-[0.97]">
                {t('cta.button', lang)} <ArrowRight className="h-4 w-4 rtl-flip transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/formations" className="inline-flex h-14 items-center rounded-2xl border border-[#D4AF37]/30 bg-white/5 px-10 text-sm font-semibold text-[#F3EAD9]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#D4AF37]/15 hover:text-[#F3EAD9] hover:border-[#D4AF37]/50 active:scale-[0.97]">
                {t('cta.secondary', lang)}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="relative overflow-hidden" style={{ backgroundColor: '#0c0704', '--fg': '#f3ead9', '--fg-muted': 'rgba(243,234,217,0.6)', '--border': 'rgba(255,255,255,0.12)', '--bg-card': 'rgba(255,255,255,0.05)' } as React.CSSProperties}>
        <img
          src={asset('images/section-alchv2.webp')}
          alt="Peinture classique d'alchimiste au travail — science et étude"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(9,7,12,0.94) 0%, rgba(9,7,12,0.8) 40%, rgba(9,7,12,0.85) 100%)' }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 relative">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-4">
               <img src={asset('logo-transparent.webp')} alt="Radiant Academy" className="h-10 w-auto mb-5" />
              <p className="text-sm leading-relaxed max-w-xs font-medium" style={{ color: 'var(--fg)' }}>{(lang === 'fr' && identity.tagline) ? identity.tagline : t('footer.tagline', lang)}</p>
              <div className="mt-6 flex gap-3">
                <a href={identity.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href={identity.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href={identity.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary)' }}><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            {([
              { title: 'footer.links', col: 'lg:col-span-2', items: [
                ...NAV.map(x => ({ label: x.label ?? t(x.key, lang), href: x.href })),
                { label: t('nav.leaderboard', lang), to: '/leaderboard' },
              ]},

              { title: 'footer.contact', col: 'lg:col-span-4', items: [
                { label: identity.phone, icon: Phone },
                { label: identity.email, icon: Mail },
                { label: identity.address, icon: MapPin },
              ]},
            ] as { title: string; col?: string; items: { label: string; to?: string; href?: string; icon?: LucideIcon }[] }[]).map((section) => (
              <div key={section.title} className={section.col || ''}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--fg-muted)' }}>{t(section.title, lang)}</h3>
                <ul className="space-y-3.5" style={{ color: 'var(--fg-muted)' }}>
                  {section.items.map((item, i) => {
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

          {/* Location */}
          <div className="mt-16 rounded-2xl sm:flex items-stretch" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex-1 p-7 flex flex-col justify-center gap-4" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, var(--accent) 10%, transparent)` }}>
                <MapPin className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-lg font-bold">{t('dashboard.location', lang)}</p>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                  Radiant Academy<br />{identity.address}<br />Algérie
                </p>
              </div>
              <a href={identity.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-5 text-xs font-semibold text-[#F3EAD9] backdrop-blur-sm transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#191008] active:scale-[0.97]">
                {t('landing.open_maps', lang)} <ArrowRight className="h-3.5 w-3.5 rtl-flip transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <a href={identity.maps_url} target="_blank" rel="noopener noreferrer" className="sm:w-2/5 block group overflow-hidden relative" style={{ borderTop: '1px solid var(--border)', textDecoration: 'none' }}>
              <div className="w-full h-56 sm:h-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white/5">
                <span className="text-sm font-medium flex items-center gap-2 px-6 text-center" style={{ color: 'var(--fg-muted)' }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />{t('landing.open_maps', lang)}
                </span>
              </div>
            </a>
          </div>

          {/* Bottom */}
          <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            <p className="font-medium">Radiant Academy &copy; {new Date().getFullYear()} &mdash; {t('footer.rights', lang)}</p>
            <div className="flex gap-8">
              <Link to="/mentions-legales" className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4">Mentions légales</Link>
              <Link to="/cgv" className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4">CGV</Link>
              <Link to="/confidentialite" className="transition-all duration-200 hover:text-[var(--fg)] hover:underline underline-offset-4">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
