import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calculator, Pen, Globe, FlaskConical, ArrowLeft, BookText } from 'lucide-react';
import SelectionHero from '@/components/formations/SelectionHero';
import YearCard from '@/components/formations/YearCard';
import SubjectCard from '@/components/formations/SubjectCard';
import { Link } from 'react-router-dom';

const YEARS = [
  { id: '1ere', title: '1ère année', subtitle: 'CP', gradient: 'from-emerald-500 to-teal-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '2eme', title: '2ème année', subtitle: 'CE1', gradient: 'from-cyan-500 to-blue-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '3eme', title: '3ème année', subtitle: 'CE2', gradient: 'from-sky-500 to-indigo-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '4eme', title: '4ème année', subtitle: 'CM1', gradient: 'from-violet-500 to-purple-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '5eme', title: '5ème année', subtitle: 'CM2', gradient: 'from-fuchsia-500 to-pink-600', icon: <BookOpen className="h-6 w-6" /> },
] as const;

const SUBJECTS_BY_YEAR: Record<string, { name: string; icon: React.ReactNode; color: string }[]> = {
  '1ere': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  ],
  '2eme': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  ],
  '3eme': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
  ],
  '4eme': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Sciences', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
  ],
  '5eme': [
    { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
    { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
    { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
    { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
    { name: 'Sciences', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
  ],
};

export default function PrimaryPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
<SelectionHero
        title="Primaire"
        subtitle="De la 1ère à la 5ème année — anglais dès la 3ème année, français dès la 4ème année, programmes allégés."
        gradient="from-emerald-600 via-teal-600 to-cyan-700"
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
            Choisissez une année
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl font-bold tracking-tight"
          >
            Quel niveau scolaire ?
          </motion.h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {YEARS.map((year, i) => (
            <YearCard
              key={year.id}
              title={year.title}
              subtitle={year.subtitle}
              gradient={year.gradient}
              icon={year.icon}
              index={i}
              onClick={() => setSelectedYear(selectedYear === year.id ? null : year.id)}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedYear && (
            <motion.div
              key={selectedYear}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16"
            >
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--fg-muted)' }}>
                    Matières disponibles — {YEARS.find(y => y.id === selectedYear)?.title}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
                </div>
              </div>

              <div className="mx-auto max-w-2xl space-y-3">
                {SUBJECTS_BY_YEAR[selectedYear]?.map((subject, i) => (
                  <SubjectCard
                    key={subject.name}
                    name={subject.name}
                    icon={subject.icon}
                    color={subject.color}
                    index={i}
                    onClick={() => navigate(`/teachers?subject=${encodeURIComponent(subject.name)}`)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
