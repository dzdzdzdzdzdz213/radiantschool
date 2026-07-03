import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export interface StudentKpi {
  attendanceRate: number;
  todayClasses: number;
  homeworkDue: number;
  homeworkCompleted: number;
  coursesEnrolled: number;
  upcomingLessons: number;
  pendingPayments: number;
  remainingBalance: number;
  learningProgress: number;
  privateLessons: number;
  vipLessons: number;
  certificatesEarned: number;
  nextClassToday: string | null;
  nextClassTime: string | null;
  nextClassCourse: string | null;
  nextClassRoom: string | null;
}

export function useStudentDashboard() {
  const { profile } = useAuth();
  const studentId = profile?.id;
  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = new Date().toTimeString().slice(0, 5);

  const { data: kpi, isLoading: kpiLoading, isError: kpiError } = useQuery<StudentKpi | null>({
    queryKey: ['student_dashboard_kpi', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data: enrollments } = await (supabase as any)
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', studentId)
        .eq('status', 'active');
      const enrolledCourseIds = (enrollments ?? []).map((e: any) => e.course_id);
      const coursesEnrolled = enrolledCourseIds.length;

      const [
        totalAttendance,
        presentAttendance,
        todayClassesData,
        homeworkData,
        completedHomework,
        paymentsData,
        invoicesData,
        progressData,
        privateLessonData,
        vipData,
        certData,
        nextClass,
      ] = await Promise.all([
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', studentId).then((r: any) => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'present').then((r: any) => r.count ?? 0),
        enrolledCourseIds.length > 0
          ? (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('day_of_week', dayName).in('course_id', enrolledCourseIds).then((r: any) => r.count ?? 0)
          : Promise.resolve(0),
        (supabase as any).from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'pending').then((r: any) => r.count ?? 0),
        (supabase as any).from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
        (supabase as any).from('payments').select('id, amount', { count: 'exact', head: true }).eq('student_id', studentId).then((r: any) => ({ count: r.count ?? 0 })),
        (supabase as any).from('invoices').select('total_amount, paid_amount').eq('student_id', studentId).neq('status', 'paid').neq('status', 'cancelled').then((r: any) => (r.data ?? []).reduce((s: number, inv: any) => s + ((inv.total_amount ?? 0) - (inv.paid_amount ?? 0)), 0)),
        (supabase as any).from('assignment_submissions').select('grade').eq('student_id', studentId).not('grade', 'is', null).then((r: any) => {
          const grades = (r.data ?? []).map((g: any) => g.grade).filter((g: number) => g != null);
          return grades.length > 0 ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length) : 0;
        }),
        (supabase as any).from('private_lessons').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
        (supabase as any).from('vip_classes').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
        (supabase as any).from('certificates').select('id', { count: 'exact', head: true }).eq('student_id', studentId).then((r: any) => r.count ?? 0),
        enrolledCourseIds.length > 0
          ? (supabase as any).from('course_schedules').select('id, start_time, end_time, course:courses!inner(name), room:rooms(name)').eq('day_of_week', dayName).in('course_id', enrolledCourseIds).gte('start_time', currentTime).order('start_time').limit(1).then((r: any) => r.data?.[0] ?? null)
          : Promise.resolve(null),
      ]);

      const rate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

      return {
        attendanceRate: rate,
        todayClasses: todayClassesData,
        homeworkDue: homeworkData,
        homeworkCompleted: completedHomework,
        coursesEnrolled,
        upcomingLessons: nextClass !== null ? 1 : 0,
        pendingPayments: paymentsData.count,
        remainingBalance: invoicesData,
        learningProgress: progressData,
        privateLessons: privateLessonData,
        vipLessons: vipData,
        certificatesEarned: certData,
        nextClassToday: nextClass ? `${nextClass.course?.name ?? ''} à ${nextClass.start_time ?? ''}` : null,
        nextClassTime: nextClass?.start_time ?? null,
        nextClassCourse: nextClass?.course?.name ?? null,
        nextClassRoom: nextClass?.room?.name ?? null,
      };
    },
    enabled: !!studentId,
    refetchInterval: 30000,
  });

  return { kpi, kpiLoading, kpiError };
}
