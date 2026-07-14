import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calculator, FlaskConical, Pen, Globe, BookText,
  History, Brain, GraduationCap, ArrowLeft, Sigma,
  Building2, Cog, CircuitBoard, TestTube, Languages,
} from 'lucide-react';
import SelectionHero from '@/components/formations/SelectionHero';
import YearCard from '@/components/formations/YearCard';
import StreamCard from '@/components/formations/StreamCard';
import SubjectCard from '@/components/formations/SubjectCard';
import { Link } from 'react-router-dom';

const YEAR_OPTIONS = [
  { id: '1as', title: '1ère AS', subtitle: 'Tronc Commun', gradient: 'from-blue-600 to-indigo-700', icon: <BookOpen className="h-6 w-6" /> },
  { id: '2as', title: '2ème AS', subtitle: 'Lettres ou Sciences', gradient: 'from-indigo-600 to-violet-700', icon: <BookOpen className="h-6 w-6" /> },
  { id: '3as', title: '3ème AS', subtitle: 'Baccalauréat', gradient: 'from-violet-600 to-purple-800', icon: <GraduationCap className="h-6 w-6" /> },
] as const;

const STREAMS: Record<string, { id: string; title: string; description: string; icon: React.ReactNode; gradient: string }[]> = {
  '1as': [
    { id: 'tc-sciences', title: 'Tronc Commun Sciences', description: 'Bases scientifiques pour préparer votre orientation', icon: <FlaskConical className="h-6 w-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'tc-lettres', title: 'Tronc Commun Lettres', description: 'Bases littéraires pour préparer votre orientation', icon: <BookText className="h-6 w-6" />, gradient: 'from-amber-500 to-orange-600' },
  ],
  '2as': [
    { id: 'scientifique', title: 'Scientifique', description: 'Sciences Expérimentales', icon: <FlaskConical className="h-6 w-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'mathematiques', title: 'Mathématiques', description: 'Mathématiques pures', icon: <Sigma className="h-6 w-6" />, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'maths-tech', title: 'Maths Techniques', description: 'Génie et technologies', icon: <Cog className="h-6 w-6" />, gradient: 'from-sky-500 to-indigo-600' },
    { id: 'gestion-economie', title: 'Gestion et Économie', description: 'Économie et management', icon: <Calculator className="h-6 w-6" />, gradient: 'from-violet-500 to-purple-600' },
    { id: 'lettres', title: 'Littéraire', description: 'Lettres & Philosophie', icon: <BookText className="h-6 w-6" />, gradient: 'from-fuchsia-500 to-pink-600' },
  ],
  '3as': [
    { id: 'scientifique', title: 'Scientifique', description: 'Sciences Expérimentales', icon: <FlaskConical className="h-6 w-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'mathematiques', title: 'Mathématiques', description: 'Mathématiques pures', icon: <Sigma className="h-6 w-6" />, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'lettres', title: 'Littéraire', description: 'Lettres & Philosophie', icon: <BookText className="h-6 w-6" />, gradient: 'from-fuchsia-500 to-pink-600' },
    { id: 'gestion-economie', title: 'Gestion et Économie', description: 'Économie et management', icon: <Calculator className="h-6 w-6" />, gradient: 'from-violet-500 to-purple-600' },
  ],
};

const SUBJECTS_BY_STREAM: Record<string, { name: string; icon: React.ReactNode; color: string }[]> = {
  'scientifique': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Physique', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
    { name: 'Sciences', icon: <Brain className="h-5 w-5" />, color: '#059669' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  ],
  'mathematiques': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Physique', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
    { name: 'Sciences', icon: <Brain className="h-5 w-5" />, color: '#059669' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  ],
  'tc-sciences': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Physique', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
    { name: 'Sciences', icon: <Brain className="h-5 w-5" />, color: '#059669' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  ],
  'tc-lettres': [
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Histoire', icon: <History className="h-5 w-5" />, color: '#dc2626' },
    { name: 'Philosophie', icon: <BookText className="h-5 w-5" />, color: '#7c3aed' },
  ],
  'lettres': [
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Histoire', icon: <History className="h-5 w-5" />, color: '#dc2626' },
    { name: 'Philosophie', icon: <BookText className="h-5 w-5" />, color: '#7c3aed' },
  ],
  'gestion-economie': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Histoire', icon: <History className="h-5 w-5" />, color: '#dc2626' },
  ],
};

const MATH_TECH_STREAMS = [
  { name: 'Génie Civil', icon: <Building2 className="h-5 w-5" />, color: '#0ea5e9' },
  { name: 'Génie Mécanique', icon: <Cog className="h-5 w-5" />, color: '#f59e0b' },
  { name: 'Génie Électrique', icon: <CircuitBoard className="h-5 w-5" />, color: '#ef4444' },
  { name: 'Génie des Procédés', icon: <TestTube className="h-5 w-5" />, color: '#8b5cf6' },
];

const LANG_STREAMS = [
  { name: 'Allemand', icon: <Globe className="h-5 w-5" />, color: '#059669' },
  { name: 'Espagnol', icon: <Globe className="h-5 w-5" />, color: '#dc2626' },
];

const BACCALAUREAT_SUBJECTS = [
  { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
  { name: 'Physique', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
  { name: 'Sciences', icon: <Brain className="h-5 w-5" />, color: '#059669' },
  { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
  { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
  { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  { name: 'Histoire', icon: <History className="h-5 w-5" />, color: '#dc2626' },
  { name: 'Philosophie', icon: <BookText className="h-5 w-5" />, color: '#7c3aed' },
];

const YEAR_LABELS: Record<string, string> = {
  '1as': '1ère AS',
  '2as': '2ème AS',
  '3as': '3ème AS',
};

export default function HighSchoolPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  function resetFilters() {
    setSelectedYear(null);
    setSelectedStream(null);
  }

  function selectYear(id: string) {
    if (selectedYear === id) {
      resetFilters();
    } else {
      setSelectedYear(id);
      setSelectedStream(null);
    }
  }

  function selectStream(id: string) {
    setSelectedStream(selectedStream === id ? null : id);
  }

  function handleSubjectClick(subjectName: string) {
    navigate(`/teachers?subject=${encodeURIComponent(subjectName)}`);
  }

  const streams = selectedYear ? STREAMS[selectedYear] ?? [] : [];
  const subjects = selectedStream ? SUBJECTS_BY_STREAM[selectedStream] ?? [] : [];

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
      <SelectionHero
        title="Lycée"
        subtitle="De la 1ère à la 3ème AS — Préparez votre baccalauréat avec un accompagnement adapté à votre filière."
        gradient="from-blue-600 via-indigo-700 to-violet-800"
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-6">
          <Link
            to="/#courses"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-[var(--primary)]"
            style={{ color: 'var(--fg-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux formations
          </Link>
        </div>

        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--primary)' }}
          >
            {selectedYear ? `Étape ${selectedStream ? '3' : '2'} sur 3` : 'Étape 1 sur 3'}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-bold tracking-tight"
          >
            {!selectedYear
              ? 'Choisissez votre année'
              : !selectedStream
                ? 'Choisissez votre filière'
                : 'Choisissez une matière'}
          </motion.h2>

          {selectedYear && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={resetFilters}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 hover:text-[var(--primary)]"
              style={{ color: 'var(--fg-muted)' }}
            >
              <ArrowLeft className="h-3 w-3" /> Réinitialiser
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!selectedYear && (
            <motion.div
              key="year-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {YEAR_OPTIONS.map((year, i) => (
                <YearCard
                  key={year.id}
                  title={year.title}
                  subtitle={year.subtitle}
                  gradient={year.gradient}
                  icon={year.icon}
                  index={i}
                  onClick={() => selectYear(year.id)}
                />
              ))}
            </motion.div>
          )}

          {selectedYear && !selectedStream && (
            <motion.div
              key={`streams-${selectedYear}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedYear === '2as' && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                        Filières Scientifiques
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {streams.filter(s => ['scientifique', 'mathematiques', 'maths-tech', 'gestion-economie'].includes(s.id)).map((stream, i) => (
                      <StreamCard
                        key={stream.id}
                        title={stream.title}
                        description={stream.description}
                        icon={stream.icon}
                        gradient={stream.gradient}
                        index={i}
                        onClick={() => selectStream(stream.id)}
                      />
                    ))}
                  </div>

                  {selectedStream === 'maths-tech' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-10"
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                            Spécialités Maths Techniques
                          </span>
                          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {MATH_TECH_STREAMS.map((s, i) => (
                          <SubjectCard
                            key={s.name}
                            name={s.name}
                            icon={s.icon}
                            color={s.color}
                            index={i}
                            onClick={() => handleSubjectClick(s.name)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="mb-8 mt-12">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                        Filières Littéraires
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {streams.filter(s => ['lettres'].includes(s.id)).map((stream, i) => (
                      <StreamCard
                        key={stream.id}
                        title={stream.title}
                        description={stream.description}
                        icon={stream.icon}
                        gradient={stream.gradient}
                        index={i}
                        onClick={() => selectStream(stream.id)}
                      />
                    ))}
                  </div>

                  <div className="mt-10">
                    <div className="mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                          Langues
                        </span>
                        <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {LANG_STREAMS.map((s, i) => (
                        <SubjectCard
                          key={s.name}
                          name={s.name}
                          icon={s.icon}
                          color={s.color}
                          index={i}
                          onClick={() => handleSubjectClick(s.name)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedYear !== '2as' && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {streams.map((stream, i) => (
                    <StreamCard
                      key={stream.id}
                      title={stream.title}
                      description={stream.description}
                      icon={stream.icon}
                      gradient={stream.gradient}
                      index={i}
                      onClick={() => selectStream(stream.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {selectedStream && (
            <motion.div
              key={`subjects-${selectedStream}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              {selectedStream !== 'maths-tech' && subjects.length > 0 && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                        Matières — {streams.find(s => s.id === selectedStream)?.title}
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    </div>
                  </div>

                  <div className="mx-auto max-w-2xl space-y-3">
                    {subjects.map((subject, i) => (
                      <SubjectCard
                        key={subject.name}
                        name={subject.name}
                        icon={subject.icon}
                        color={subject.color}
                        index={i}
                        onClick={() => handleSubjectClick(subject.name)}
                      />
                    ))}
                  </div>
                </>
              )}

              {selectedStream === 'lettres' && (
                <div className="mt-10">
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                        Langues
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {LANG_STREAMS.map((s, i) => (
                      <SubjectCard
                        key={s.name}
                        name={s.name}
                        icon={s.icon}
                        color={s.color}
                        index={i}
                        onClick={() => handleSubjectClick(s.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
