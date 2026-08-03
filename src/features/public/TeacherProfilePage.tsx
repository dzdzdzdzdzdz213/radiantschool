import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Users, Award, BookOpen, Calendar, Clock, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';
import { useTeacherProfile } from '@/hooks/useTeachers';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: teacher, isLoading } = useTeacherProfile(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Professeur introuvable</p>
        <Link to="/teachers" className="btn-primary">Voir tous les professeurs</Link>
      </div>
    );
  }

  const DAY_LABELS: Record<string, string> = {
    '0': 'Dimanche', '1': 'Lundi', '2': 'Mardi', '3': 'Mercredi',
    '4': 'Jeudi', '5': 'Vendredi', '6': 'Samedi',
  };

  return (
    <div className="min-h-screen" style={{ color: 'var(--fg)' }}>
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] px-6 py-16">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <Link
            to="/teachers"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux professeurs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 md:flex-row"
          >
            <div className="h-40 w-40 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
              {teacher.photo_url ? (
                <img src={teacher.photo_url} alt={`${teacher.first_name} ${teacher.last_name}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
                  <span className="text-5xl font-bold text-white/80">
                    {teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white">
                {teacher.first_name} {teacher.last_name}
              </h1>
              <p className="mt-1 text-lg text-white/80">
                Enseignant
              </p>

              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
                  <Award className="h-4 w-4" />
                  {teacher.yearsActive} ans d'expérience
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
                  <Star className="h-4 w-4 text-yellow-300" />
                  {teacher.avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
                  <Users className="h-4 w-4" />
                  {teacher.studentCount} élèves
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
                  <BookOpen className="h-4 w-4" />
                  {teacher.courseCount} cours
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {teacher.biography && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
              >
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <GraduationCap className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  Biographie
                </h2>
                <p className="leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{teacher.biography}</p>
              </motion.div>
            )}

            {teacher.reviews && teacher.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
              >
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <Star className="h-5 w-5" style={{ color: '#f59e0b' }} />
                  Avis des élèves
                </h2>
                <div className="space-y-4">
                  {teacher.reviews.slice(0, 5).map((review, i: number) => (
                    <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg)' }}>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className="h-3.5 w-3.5"
                              style={{ color: s < Math.round(review.average_score ?? 0) ? '#f59e0b' : 'var(--border)' }}
                              fill={s < Math.round(review.average_score ?? 0) ? '#f59e0b' : 'transparent'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>
                          {review.average_score?.toFixed(1)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {teacher.courses && teacher.courses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
              >
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <BookOpen className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  Cours disponibles
                </h2>
                <div className="space-y-4">
                  {teacher.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ backgroundColor: 'var(--bg)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{course.name}</p>
                        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                          {course.level?.name}{course.level?.stream ? ` — ${course.level.stream}` : ''}
                          {course.subject?.name ? ` · ${course.subject.name}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-bold" style={{ color: 'var(--primary)' }}>
                          {formatCurrency(course.price)}
                        </p>
                        {course.capacity && (
                          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                            {course.current_enrollments ?? 0}/{course.capacity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
            >
              <h2 className="mb-4 text-lg font-bold">Informations</h2>
              <div className="space-y-3 text-sm">
                {teacher.email && (
                  <div className="flex items-center gap-3" style={{ color: 'var(--fg-muted)' }}>
                    <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center gap-3" style={{ color: 'var(--fg-muted)' }}>
                    <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.address && (
                  <div className="flex items-center gap-3" style={{ color: 'var(--fg-muted)' }}>
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span>{teacher.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3" style={{ color: 'var(--fg-muted)' }}>
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                  <span>Membre depuis {teacher.created_at ? formatDate(teacher.created_at) : '—'}</span>
                </div>
              </div>
            </motion.div>

            {teacher.schedules && teacher.schedules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
              >
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Clock className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  Disponibilités
                </h2>
                <div className="space-y-2">
                  {teacher.schedules.map((sched) => (
                    <div key={sched.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg)' }}>
                      <span className="font-medium">{DAY_LABELS[sched.day_of_week] ?? `Jour ${sched.day_of_week}`}</span>
                      <span style={{ color: 'var(--fg-muted)' }}>
                        {sched.start_time?.slice(0, 5)} — {sched.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
              }}
            >
              <p className="text-xl font-bold text-white mb-2">Prêt à commencer ?</p>
              <p className="text-sm text-white/80 mb-6">
                Inscrivez-vous aux cours de {teacher.first_name}
              </p>
              <Link
                to="/enroll"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.97]"
                style={{ color: 'var(--primary)' }}
              >
                S'inscrire maintenant
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
