import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Award, Users, ClipboardCheck, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherReportsPage() {
  const { profile } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacher-reports', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const courseRes = await supabase.from('courses').select('id, current_enrollments, capacity').eq('teacher_id', profile.id).in('status', ['active']);
      const courseIds = (courseRes.data ?? []).map(c => c.id);
      const courses = courseRes.data ?? [];

      const enrollRes = await supabase.from('course_enrollments').select('student_id')
        .in('course_id', courseIds.length ? courseIds : [-1]);
      const enrollments = enrollRes.data ?? [];

      const evalRes = await supabase.from('evaluations').select('average_score').eq('teacher_id', profile.id);
      const evals = evalRes.data ?? [];

      let presentCount = 0, totalAtt = 0;
      if (courseIds.length) {
        const { data: sessions } = await supabase.from('attendance_sessions').select('id').in('course_id', courseIds);
        const sessionIds = sessions?.map(s => s.id) ?? [];
        if (sessionIds.length) {
          const { data: records } = await supabase.from('attendance_records').select('status').in('session_id', sessionIds);
          presentCount = (records ?? []).filter((a) => a.status === 'present').length;
          totalAtt = (records ?? []).length;
        }
      }

      const uniqueStudents = new Set(enrollments.map((e) => e.student_id));
      const totalCapacity = courses.reduce((s: number, c: any) => s + Number(c.capacity), 0);
      const totalEnrolled = courses.reduce((s: number, c: any) => s + (c.current_enrollments ?? 0), 0);
      const avgScore = evals.length ? (evals.reduce((s: number, e: any) => s + Number(e.average_score ?? 0), 0) / evals.length).toFixed(1) : '—';

      return {
        courseCount: courses.length,
        studentCount: uniqueStudents.size,
        occupancyRate: totalCapacity ? Math.round((totalEnrolled / totalCapacity) * 100) : 0,
        avgRating: avgScore,
        evalCount: evals.length,
        attendanceRate: totalAtt ? Math.round((presentCount / totalAtt) * 100) : 0,
      };
    },
    enabled: !!profile?.id,
  });

  const items = [
    { icon: Users, label: 'Élèves', value: stats?.studentCount ?? '...', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: TrendingUp, label: 'Taux d\'occupation', value: stats ? `${stats.occupancyRate}%` : '...', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Star, label: 'Note moyenne', value: stats?.avgRating ?? '...', color: 'text-amber-600', bg: 'bg-amber-100' },
    { icon: ClipboardCheck, label: 'Assiduité', value: stats ? `${stats.attendanceRate}%` : '...', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Award, label: 'Évaluations', value: stats?.evalCount ?? '...', color: 'text-rose-600', bg: 'bg-rose-100' },
    { icon: BarChart3, label: 'Formations', value: stats?.courseCount ?? '...', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" />Rapports</h1>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color} mx-auto mb-3`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-xl sm:text-2xl font-bold">{isLoading ? '...' : item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Synthèse</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nombre de formations actives</span><span className="font-semibold">{stats.courseCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Élèves uniques</span><span className="font-semibold">{stats.studentCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Taux d'occupation moyen</span><span className="font-semibold">{stats.occupancyRate}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Note moyenne des évaluations</span><span className="font-semibold">{stats.avgRating}/5</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Taux de présence</span><span className="font-semibold">{stats.attendanceRate}%</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
