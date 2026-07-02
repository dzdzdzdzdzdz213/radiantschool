import { useState } from 'react';
import { BarChart3, Download, FileText, Calendar, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function ReportsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const [period, setPeriod] = useState<'month' | 'trimester' | 'year'>('month');

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['teacher_reports', profile?.id, period],
    queryFn: async () => {
      if (!profile?.id) return null;
      const [totalResult] = await Promise.all([
        (supabase as any).from('course_enrollments').select('*', { count: 'exact', head: true }).eq('course.teacher_id', profile.id).then((r: any) => { if (r.error) throw r.error; return r; }),
      ]);
      const totalStudents = totalResult.count ?? 0;
      const { data: r1, error: e1 } = await (supabase as any).from('attendance').select('status, count').eq('course_schedule.course.teacher_id', profile.id);
      if (e1) throw e1;
      const { data: r2, error: e2 } = await (supabase as any).from('assignments').select('id, grade').eq('teacher_id', profile.id);
      if (e2) throw e2;
      const present = (r1 ?? []).filter((a: any) => a.status === 'present').length;
      const total = (r1 ?? []).length;
      const grades = (r2 ?? []).filter((a: any) => a.grade).map((a: any) => a.grade);
      const avgGrade = grades.length > 0 ? grades.reduce((a: number, b: number) => a + b, 0) / grades.length : 0;
      return { totalStudents, attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0, avgGrade: Math.round(avgGrade * 10) / 10, assignmentsCount: (r2 ?? []).length, present, totalAttendance: total };
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.reports', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <Button variant="outline" className="h-9 gap-2" onClick={() => {
          try {
            if (!stats) { toast(t('common.error', lang), 'error'); return; }
            const csv = [
              'Statistique,Valeur',
              `${t('dashboard.stat.active_students', lang)},${stats.totalStudents}`,
              `${t('dashboard.stat.attendance_rate', lang)},${stats.attendanceRate}%`,
              `${t('dashboard.stat.avg_grade', lang)},${stats.avgGrade}/20`,
              `${t('nav.assignments', lang)},${stats.assignmentsCount}`,
              `${t('status.present', lang)},${stats.present}`,
              `${t('status.absent', lang)},${stats.totalAttendance - stats.present}`,
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `rapport-${period}.csv`; a.click();
            URL.revokeObjectURL(url);
            toast(t('success.created', lang, 'Export CSV'), 'success');
          } catch (err: any) {
            toast(err?.message ?? t('common.error', lang), 'error');
          }
        }}><Download className="h-4 w-4" />{t('common.export', lang)}</Button>
      </div>
      <div className="flex gap-2">
        {(['month', 'trimester', 'year'] as const).map(p => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => setPeriod(p)}>
            {p === 'month' ? t('common.this_month', lang) : p === 'trimester' ? 'Trimestre' : t('common.date', lang)}
          </Button>
        ))}
      </div>
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-center">
          <p className="text-red-600 font-medium text-sm">{t('errors.load_error', lang, '')}</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5" />{t('dashboard.stat.active_students', lang)}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-16 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{stats?.totalStudents ?? 0}</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" />{t('dashboard.stat.attendance', lang)}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-16 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{stats?.attendanceRate ?? 0}%</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Award className="h-3.5 w-3.5" />{t('dashboard.stat.avg_grade', lang)}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-16 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{stats?.avgGrade ?? 0}/20</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><FileText className="h-3.5 w-3.5" />{t('nav.assignments', lang)}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-16 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{stats?.assignmentsCount ?? 0}</p>}</CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-sm">{t('dashboard.stat.attendance', lang)}</CardTitle></CardHeader><CardContent><div className="space-y-3">{stats ? (<div className="space-y-2"><div className="flex justify-between text-sm"><span>{t('status.present', lang)}</span><span className="font-medium">{stats.present}</span></div><div className="h-2 bg-accent rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.attendanceRate}%` }} /></div><div className="flex justify-between text-sm text-muted-foreground"><span>{t('status.absent', lang)}</span><span>{stats.totalAttendance - stats.present}</span></div></div>) : <div className="h-20 bg-muted rounded animate-pulse" />}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">{t('dashboard.stat.avg_grade', lang)}</CardTitle></CardHeader><CardContent><div className="space-y-3">{stats ? (<div className="space-y-2"><div className="flex justify-between text-sm"><span>{t('dashboard.stat.avg_grade', lang)}</span><span className="font-medium">{stats.avgGrade}/20</span></div><div className="h-2 bg-accent rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(stats.avgGrade / 20) * 100}%` }} /></div><div className="flex justify-between text-sm text-muted-foreground"><span>{t('nav.assignments', lang)}</span><span>{stats.assignmentsCount}</span></div></div>) : <div className="h-20 bg-muted rounded animate-pulse" />}</div></CardContent></Card>
      </div>
    </div>
  );
}
