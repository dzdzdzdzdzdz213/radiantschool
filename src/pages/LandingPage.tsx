import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePublicCourses, usePublicStats } from '@/hooks/usePublicData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { t, LANGUAGES } from '@/i18n';
import { Menu, X, Sun, Moon, Globe, ArrowRight, BookOpen, Users, GraduationCap, Sparkles, ChevronRight, Star, Award, Shield, MapPin, Phone, Mail, BarChart3, RefreshCw, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
  - Swap every placeholder photo path (/team/*.jpg, /images/*.jpg)
    for real photos of your actual teachers/students. Placeholder
    photos are the fastest way to make a "human" section feel fake —
    real faces are what actually does the work here.
  - The founder story copy is a starting draft — rewrite it in your
    own voice/details (year founded, real name, real anecdote).
*/

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
  { href: '/formations', key: 'nav.formations', label: undefined as string | undefined },
  { href: '#about', key: 'nav.apropos', label: 'Qui sommes-nous' },
  { href: '#why', key: 'nav.pourquoi', label: undefined as string | undefined },
  { href: '#contact', key: 'nav.contact', label: undefined as string | undefined },
];

// Placeholder team data — replace photos + bios with your real team.
const TEAM = [
  { name: 'Amina B.', role: 'Fondatrice — Prof de Mathématiques', years: '12 ans d\'expérience', photo: '/team/amina.jpg' },
  { name: 'Yacine K.', role: 'Prof de Physique', years: '8 ans d\'expérience', photo: '/team/yacine.jpg' },
  { name: 'Sarah M.', role: 'Prof de Français', years: '6 ans d\'expérience', photo: '/team/sarah.jpg' },
  { name: 'Riad T.', role: 'Coordinateur pédagogique', years: '10 ans d\'expérience', photo: '/team/riad.jpg' },
];

export default function LandingPage() {
  const { toast } = useToast();
  const { data: courses, isError: coursesError } = usePublicCourses();
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const teacherCount = new Set((courses ?? []).map((c: any) => c.teacher?.id)).size;
  const levelCount = new Set((courses ?? []).map((c: any) => c.level?.name)).size;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      {/* Signature accent font — used ONLY for handwritten-style touches
          (founder signature, sticky-note captions). Ideally move this
          <link> into your index.html <head> instead of injecting it
          here, for better font-loading performance. */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');
        .font-handwritten { font-family: 'Caveat', cursive; }`}</style>

      {/* HEADER */}
      <header className="glass-header fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo-transparent.webp" alt="Radiant Academy" className="h-9 w-auto" />
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
            {/* Auth links — shown in the mobile menu since the header
                buttons above are hidden below the sm breakpoint */}
            <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost h-11 text-sm">
                {t('auth.sign_in', lang)}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 45% at 20% 45%, color-mix(in srgb, var(--primary) 7%, transparent), transparent 70%), radial-gradient(ellipse 40% 35% at 80% 35%, color-mix(in srgb, #a78bfa 5%, transparent), transparent 70%)` }} />
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
                <Link to="/formations" className="btn-primary h-14 px-10 text-base gap-2.5 w-full sm:w-auto shadow-2xl shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-[0.97]">
                  {t('hero.cta1', lang)} <ArrowRight className="h-4 w-4 rtl-flip" />
                </Link>
                <Link to="/enroll" className="btn-ghost h-14 px-10 text-base w-full sm:w-auto">
                  {t('hero.cta2', lang)}
                </Link>
              </div>

              {/* Humanizing touch: real-parents trust strip, right under the CTAs */}
              <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start animate-up" style={{ animationDelay: '0.18s' }}>
                <div className="flex -space-x-3">
                  {['/avatars/parent1.jpg', '/avatars/parent2.jpg', '/avatars/parent3.jpg', '/avatars/parent4.jpg'].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full object-cover" style={{ border: '2px solid var(--bg)' }} />
                  ))}
                </div>
                <p className="text-xs font-medium text-left" style={{ color: 'var(--fg-muted)' }}>
                  Rejoint par <span style={{ color: 'var(--fg)', fontWeight: 700 }}>{stats?.studentCount ?? '200'}+</span> familles à Alger
                </p>
              </div>

              <div className="mt-12 animate-up" style={{ animationDelay: '0.2s' }}>
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

            {/* Humanizing touch: a real photo + a rotated Polaroid-style
                card with a handwritten caption, instead of an abstract
                logo-in-a-blob visual. */}
            <div className="flex-1 flex justify-center lg:justify-end animate-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative w-80 sm:w-[26rem] h-80 sm:h-[26rem]">
                <div className="relative w-full h-full rounded-[32px] overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}>
                  <img
                    src="/images/hero-classroom.jpg"
                    alt="Élèves et professeurs de Radiant Academy en cours"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rotated Polaroid card, the one "signature" human element */}
                <div
                  className="absolute -bottom-8 -left-10 w-44 rounded-lg p-3 pb-4"
                  style={{ backgroundColor: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.18)', transform: 'rotate(-6deg)' }}
                >
                  <img src="/images/hero-polaroid.jpg" alt="Un cours de soutien à Radiant Academy" className="w-full h-28 object-cover rounded-sm mb-2" />
                  <p className="font-handwritten text-lg leading-none text-center" style={{ color: '#1f2937' }}>
                    On y arrive ensemble ✏️
                  </p>
                </div>

                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 25%, transparent)` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUI SOMMES-NOUS */}
      <section id="about" className="scroll-mt-20 py-28 px-6 relative overflow-hidden">
        <div className="mx-auto max-w-7xl">
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
                <img src="/team/founder.jpg" alt="Fondatrice de Radiant Academy" className="h-16 w-16 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--bg)', boxShadow: '0 0 0 1px var(--border)' }} />
                <div>
                  <p className="font-handwritten text-3xl leading-none mb-1" style={{ color: 'var(--primary)' }}>Amina B.</p>
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Fondatrice — prof de mathématiques depuis 12 ans</p>
                </div>
              </div>
            </div>

            {/* Photo collage */}
            <div className="relative h-[420px] hidden lg:block">
              <img
                src="/images/about-main.jpg"
                alt="L'équipe de Radiant Academy"
                className="absolute top-0 right-0 w-72 h-80 object-cover rounded-2xl"
                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
              />
              <img
                src="/images/about-secondary.jpg"
                alt="Un cours de soutien scolaire"
                className="absolute bottom-0 left-0 w-56 h-64 object-cover rounded-2xl"
                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '4px solid var(--bg)' }}
              />
              <div
                className="absolute bottom-16 right-10 rounded-lg p-3 w-40"
                style={{ backgroundColor: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.18)', transform: 'rotate(4deg)' }}
              >
                <p className="font-handwritten text-lg leading-tight text-center" style={{ color: '#1f2937' }}>
                  Merci pour cette année ❤️ — un parent
                </p>
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
              {TEAM.map((member, i) => (
                <div
                  key={member.name}
                  className="group rounded-2xl overflow-hidden animate-up transition-all duration-300 hover:-translate-y-1.5"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`, boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
            <Link to="/formations" className="inline-flex h-14 items-center rounded-2xl border-2 px-10 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.97] text-base" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              {t('cta.secondary', lang)}
            </Link>
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
                ...NAV.map(x => ({ label: x.label ?? t(x.key, lang), href: x.href })),
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
                {t('landing.open_maps', lang)} <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
              </a>
            </div>
            <a href="https://www.google.com/maps/search/Radiant+Academy+Bordj+El+Bahri+Alger/" target="_blank" rel="noopener noreferrer" className="sm:w-3/5 h-56 block group overflow-hidden relative" style={{ borderTop: '1px solid var(--border)', textDecoration: 'none' }}>
              <img
                src="https://staticmap.openstreetmap.de/staticmap.php?center=36.75,3.12&zoom=15&size=600x400&maptype=mapnik"
                alt="Radiant Academy - Bordj El Bahri, Alger"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                <span className="text-white text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4" />{t('landing.open_maps', lang)}</span>
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
