import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calculator, FlaskConical, Pen, Globe, BookText, History, Brain, ArrowLeft, GraduationCap } from 'lucide-react';
import SelectionHero from '@/components/formations/SelectionHero';
import YearCard from '@/components/formations/YearCard';
import SubjectCard from '@/components/formations/SubjectCard';
import { Link } from 'react-router-dom';

const YEARS = [
  { id: '1am', title: '1ère AM', subtitle: 'Année Moyenne', gradient: 'from-orange-500 to-red-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '2am', title: '2ème AM', subtitle: 'Année Moyenne', gradient: 'from-amber-500 to-orange-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '3am', title: '3ème AM', subtitle: 'Année Moyenne', gradient: 'from-yellow-500 to-amber-600', icon: <BookOpen className="h-6 w-6" /> },
  { id: '4am', title: '4ème AM', subtitle: 'Année Moyenne', gradient: 'from-rose-500 to-pink-600', icon: <GraduationCap className="h-6 w-6" /> },
  { id: 'bem', title: 'BEM', subtitle: 'Préparation Examen', gradient: 'from-purple-600 to-violet-700', icon: <GraduationCap className="h-6 w-6" /> },
] as const;

const SUBJECTS = [
  { name: 'Mathématiques', icon: <Calculator className="h-5 w-5" />, color: '#4f46e5' },
  { name: 'Physique', icon: <FlaskConical className="h-5 w-5" />, color: '#7c3aed' },
  { name: 'Sciences', icon: <Brain className="h-5 w-5" />, color: '#059669' },
  { name: 'Français', icon: <Pen className="h-5 w-5" />, color: '#0891b2' },
  { name: 'Anglais', icon: <Globe className="h-5 w-5" />, color: '#d97706' },
  { name: 'Arabe', icon: <BookText className="h-5 w-5" />, color: '#059669' },
  { name: 'Histoire', icon: <History className="h-5 w-5" />, color: '#dc2626' },
] as const;

export default function MiddleSchoolPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <SelectionHero
        title="CEM — Collège"
        subtitle="De la 1ère à la 4ème année moyenne + Préparation BEM — Un accompagnement complet pour réussir au collège."
        gradient="from-orange-600 via-rose-600 to-pink-700"
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
            Quel niveau collège ?
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
                {SUBJECTS.map((subject, i) => (
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
