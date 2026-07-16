import { useSearchParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { useTeachersBySubject } from '@/hooks/useTeachers';
import TeacherCard from '@/components/formations/TeacherCard';

export default function TeachersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject');
  const { data: teachers, isLoading } = useTeachersBySubject(subject);

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] px-6 py-20">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Search className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {subject ? `Professeurs de ${subject}` : 'Nos professeurs'}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              {subject
                ? `Découvrez nos enseignants spécialisés en ${subject}`
                : 'Sélectionnez une matière pour voir les professeurs disponibles'}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <Link
            to={-1 as any}
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-[var(--primary)]"
            style={{ color: 'var(--fg-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[380px] rounded-2xl"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  animation: 'shimmer 2s infinite linear',
                  backgroundImage: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg) 50%, var(--bg-card) 75%)',
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </div>
        ) : !teachers || teachers.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, var(--primary) 8%, transparent)` }}>
              <Search className="h-7 w-7" style={{ color: 'var(--primary)', opacity: 0.5 }} />
            </div>
            <p className="text-lg font-semibold mb-1">Aucun professeur trouvé</p>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Aucun enseignant disponible pour cette matière pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teachers.map((teacher: any, i: number) => (
              <TeacherCard
                key={teacher.id}
                id={teacher.id}
                photoUrl={teacher.photo_url}
                firstName={teacher.first_name}
                lastName={teacher.last_name}
                specialty={subject ?? ''}
                yearsOfExperience={teacher.yearsActive}
                rating={teacher.avgRating}
                studentsCount={teacher.studentCount}
                biography={teacher.biography || teacher.bio}
                index={i}
                onClick={() => navigate(`/teachers/${teacher.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
