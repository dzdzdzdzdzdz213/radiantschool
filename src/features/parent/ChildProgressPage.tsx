import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarCheck, BookOpen, GraduationCap, FileText, TrendingUp } from 'lucide-react';
import { getFullName } from '@/lib/utils';

export default function ChildProgressPage() {
  const { childId } = useParams<{ childId: string }>();
  const { lang } = useLang();

  const { data: child } = useQuery({
    queryKey: ['child-profile', childId],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('id, first_name, last_name, email, photo_url').eq('id', childId!).single();
      return data;
    },
    enabled: !!childId,
  });

  const { data: grades } = useQuery({
    queryKey: ['child-grades', childId],
    queryFn: async () => {
      const { data } = await supabase.from('assignment_submissions')
        .select('grade, feedback, created_at, assignment:assignments!inner(title, max_grade, course:courses(name))')
        .eq('student_id', childId!)
        .not('grade', 'is', null)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!childId,
  });

  const { data: attendance } = useQuery({
    queryKey: ['attendance', 'child', childId],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('status, date').eq('student_id', childId!).order('date', { ascending: false }).limit(30);
      return data ?? [];
    },
    enabled: !!childId,
  });

  const { data: enrollments } = useQuery({
    queryKey: ['child-enrollments', childId],
    queryFn: async () => {
      const { data } = await supabase.from('course_enrollments').select('course:courses(name, subject:subjects(name))').eq('student_id', childId!).eq('status', 'active');
      return data ?? [];
    },
    enabled: !!childId,
  });

  const presentCount = attendance?.filter(a => a.status === 'present').length ?? 0;
  const totalCount = attendance?.length ?? 0;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;
  const gradedCount = grades?.length ?? 0;
  const graded = (grades ?? []).filter((g) => Number(g.grade) > 0 && Number(g.assignment?.max_grade ?? 0) > 0);
  const avgGrade = graded.length > 0 ? Math.round((graded.reduce((s, g) => s + (Number(g.grade) / Number(g.assignment?.max_grade)), 0) / graded.length) * 100) : null;

  return (
    <div className="space-y-6 p-6">
      <Link to="/parent/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {child?.first_name?.charAt(0)}{child?.last_name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{child ? getFullName(child.first_name, child.last_name) : '...'}</h1>
          <p className="text-sm text-muted-foreground">{child?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CalendarCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.stat.attendance', lang)}</p>
              <p className="text-xl font-bold">{attendanceRate != null ? `${attendanceRate}%` : '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('nav.courses', lang)}</p>
              <p className="text-xl font-bold">{enrollments?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Moyenne</p>
              <p className="text-xl font-bold">{avgGrade != null ? `${avgGrade}%` : '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
              <p className="text-xl font-bold">{gradedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Présences (30 jours)</CardTitle></CardHeader>
          <CardContent>
            {attendance && attendance.length > 0 ? (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {attendance.slice(0, 30).map((a, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm">
                    <span>{new Date(a.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      a.status === 'late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {a.status === 'present' ? 'Présent' : a.status === 'late' ? 'Retard' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune présence enregistrée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Notes récentes</CardTitle></CardHeader>
          <CardContent>
            {grades && grades.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {grades.slice(0, 10).map((s, i) => {
                  const a = s.assignment;
                  return (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.course?.name}</p>
                      </div>
                      <span className="text-sm font-bold text-primary ml-4">{s.grade}{a.max_grade ? `/${a.max_grade}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune note enregistrée</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
