import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { BookOpen, CalendarDays, MapPin, User, Clock, GraduationCap, TrendingUp , Star} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import RateTeacherDialog from '@/components/RateTeacherDialog';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer',
  thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim',
};

const SUBJECT_COLORS: Record<string, string> = {
  'Mathématiques': 'from-blue-500 to-blue-600',
  'Physique': 'from-purple-500 to-purple-600',
  'Chimie': 'from-emerald-500 to-emerald-600',
  'Français': 'from-rose-500 to-rose-600',
  'Anglais': 'from-sky-500 to-sky-600',
  'Arabe': 'from-amber-500 to-amber-600',
  'Informatique': 'from-cyan-500 to-cyan-600',
  'Histoire': 'from-orange-500 to-orange-600',
  'Géographie': 'from-teal-500 to-teal-600',
};

const FALLBACK_COLORS = [
  'from-primary to-primary/80',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-sky-500 to-sky-600',
];

function getSubjectColor(name?: string) {
  if (!name) return FALLBACK_COLORS[0];
  return SUBJECT_COLORS[name] || FALLBACK_COLORS[name.charCodeAt(0) % FALLBACK_COLORS.length];
}

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const [rateTarget, setRateTarget] = useState<{ teacherId: string; teacherName: string; courseName: string } | null>(null);
  const { lang } = useLang();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['student-courses', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select(
          `id, status, enrollment_date,
          course:courses(
            id, name, type, price, status, start_date, end_date, image_url,
            subject:subjects(name),
            level:levels(name, category, stream, year),
            teacher_id, teacher:users!teacher_id(first_name, last_name),
            room:rooms(name),
            schedules:course_schedules(day_of_week, start_time, end_time)
          )`
        )
        .eq('student_id', profile.id)
        .in('status', ['active', 'pending_approval'])
        .order('enrollment_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const formatTime = (t?: string) => t ? t.slice(0, 5) : '';
  const activeCount = enrollments?.filter((e) => e.status === 'active').length ?? 0;
  const pendingCount = enrollments?.filter((e) => e.status === 'pending_approval').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('nav.my_courses', lang)}</h1>
            <p className="text-sm text-muted-foreground">{enrollments?.length ?? 0} formation{(enrollments?.length ?? 0) !== 1 ? 's' : ''} inscrite{(enrollments?.length ?? 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats strip */}
      {enrollments && enrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <GraduationCap className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{activeCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Actives</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{pendingCount}</p>
                <p className="text-[11px] text-muted-foreground font-medium">En attente</p>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{enrollments.length}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Total</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Course cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="h-2 bg-muted/40" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted/30 animate-pulse" />
                <div className="space-y-2 mt-4">
                  <div className="h-3 w-full rounded bg-muted/20 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-muted/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !enrollments?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30 mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground">Aucune formation</p>
            <p className="text-sm text-muted-foreground mt-1">Vous n'êtes inscrit à aucune formation pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e, idx: number) => {
            const c = e.course;
            const gradient = getSubjectColor(c?.subject?.name);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  {/* Colored top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                  <div className="p-5 space-y-3.5">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate text-[15px]">{c?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c?.subject?.name}{c?.level?.name ? ` · ${c.level.name}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        e.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {e.status === 'active' ? 'Actif' : 'En attente'}
                      </span>
                    </div>

                    {/* Teacher + rate */}
                    {c?.teacher && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground min-w-0">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 shrink-0">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium truncate">{c.teacher.first_name} {c.teacher.last_name}</span>
                        </div>
                        {c.teacher_id && e.status === 'active' && (
                          <button
                            onClick={() => setRateTarget({
                              teacherId: c.teacher_id,
                              teacherName: `${c.teacher.first_name} ${c.teacher.last_name}`,
                              courseName: c.name ?? '',
                            })}
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                          >
                            <Star className="h-3 w-3" /> Noter
                          </button>
                        )}
                      </div>
                    )}

                    {/* Room */}
                    {c?.room && (
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
                          <MapPin className="h-3 w-3 text-orange-500" />
                        </div>
                        <span className="font-medium">{c.room.name}</span>
                      </div>
                    )}

                    {/* Schedule */}
                    {c?.schedules?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {c.schedules.map((s, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {DAY_LABELS[s.day_of_week] || s.day_of_week} {formatTime(s.start_time)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                          {c?.type}
                        </span>
                        {c?.start_date && (
                          <span className="text-[11px] text-muted-foreground">{c.start_date.slice(0, 10)}</span>
                        )}
                      </div>
                      {c?.price != null && c.price > 0 && (
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(c.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {rateTarget && (
        <RateTeacherDialog
          open={!!rateTarget}
          onClose={() => setRateTarget(null)}
          teacherId={rateTarget.teacherId}
          teacherName={rateTarget.teacherName}
          courseName={rateTarget.courseName}
        />
      )}
    </div>
  );
}
