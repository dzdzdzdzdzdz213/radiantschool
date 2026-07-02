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

  const { data: kpi, isLoading: kpiLoading, isError: kpiError } = useQuery<StudentKpi>({
    queryKey: ['student_dashboard_kpi', studentId],
    queryFn: async () => {
      if (!studentId) return {} as StudentKpi;

      let totalAttendance = 0, presentAttendance = 0, todayClassesData = 0, homeworkData = 0, completedHomework = 0, coursesData = 0, paymentsData = { count: 0 }, invoicesData = 0, progressData = 0, privateLessonData = 0, vipData = 0, certData = 0, scheduleData = null, nextClass = null;

      try {
        [
          totalAttendance,
          presentAttendance,
          todayClassesData,
          homeworkData,
          completedHomework,
          coursesData,
          scheduleData,
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
          (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('day_of_week', dayName).then((r: any) => r.count ?? 0),
          (supabase as any).from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'pending').then((r: any) => r.count ?? 0),
          (supabase as any).from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
          (supabase as any).from('course_enrollments').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'active').then((r: any) => r.count ?? 0),
          (supabase as any).from('course_schedules').select('*').eq('day_of_week', dayName).gte('start_time', new Date().toTimeString().slice(0, 5)).order('start_time').limit(1).then((r: any) => r.data?.[0] ?? null),
          (supabase as any).from('payments').select('id, amount', { count: 'exact', head: true }).eq('student_id', studentId).then((r: any) => ({ count: r.count ?? 0 })),
          (supabase as any).from('invoices').select('total_amount, paid_amount').eq('student_id', studentId).neq('status', 'paid').neq('status', 'cancelled').then((r: any) => (r.data ?? []).reduce((s: number, inv: any) => s + ((inv.total_amount ?? 0) - (inv.paid_amount ?? 0)), 0)),
          Promise.resolve(0),
          (supabase as any).from('private_lessons').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
          (supabase as any).from('vip_classes').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'completed').then((r: any) => r.count ?? 0),
          (supabase as any).from('certificates').select('id', { count: 'exact', head: true }).eq('student_id', studentId).then((r: any) => r.count ?? 0),
          (supabase as any).from('course_schedules').select('id, start_time, end_time, course:courses!inner(name), room:rooms(name)').eq('day_of_week', dayName).gte('start_time', new Date().toTimeString().slice(0, 5)).order('start_time').limit(1).then((r: any) => r.data?.[0] ?? null),
        ]);
      } catch (e) {
        throw e;
      }

      const rate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

      return {
        attendanceRate: rate,
        todayClasses: todayClassesData,
        homeworkDue: homeworkData,
        homeworkCompleted: completedHomework,
        coursesEnrolled: coursesData,
        upcomingLessons: scheduleData !== null && typeof scheduleData === 'object' ? 1 : 0,
        pendingPayments: paymentsData.count,
        remainingBalance: invoicesData,
        learningProgress: progressData,
        privateLessons: privateLessonData,
        vipLessons: vipData,
        certificatesEarned: certData,
        nextClassToday: nextClass?.course?.name ?? null,
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
