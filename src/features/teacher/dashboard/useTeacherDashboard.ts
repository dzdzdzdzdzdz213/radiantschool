import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface TeacherKpi {
  todayClasses: number;
  studentsToday: number;
  attendanceRate: number;
  absentStudents: number;
  upcomingClasses: number;
  assignmentsPending: number;
  resourcesUploaded: number;
  teachingHoursMonth: number;
  revenueMonth: number;
  completedLessons: number;
  privateLessonsToday: number;
  vipSessionsToday: number;
}

export interface TodayClass {
  id: string;
  courseName: string;
  groupName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  status: string;
}

export function useTeacherDashboard() {
  const { profile } = useAuth();
  const teacherId = profile?.id;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const kpiQuery = useQuery({
    queryKey: ['teacher_dashboard_kpi', teacherId],
    queryFn: async () => {
      if (!teacherId) return {} as TeacherKpi;
      const [todayClasses, studentsToday, attendanceRate, absent, upcoming, assignments, resources, hours, revenue, completed, privateLessons, vip] = await Promise.all([
        (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('day_of_week', dayName).then((r: any) => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).then((r: any) => r.count ?? 0),
        (supabase as any).rpc('get_dashboard_stats', { stat: 'attendance_rate' }).then((r: any) => r.data ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'absent').then((r: any) => r.count ?? 0),
        (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).gte('start_time', currentTime).then((r: any) => r.count ?? 0),
        (supabase as any).from('assignments').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).is('due_date', null).then((r: any) => r.count ?? 0),
        (supabase as any).from('resources').select('id', { count: 'exact', head: true }).eq('uploaded_by', teacherId).then((r: any) => r.count ?? 0),
        (supabase as any).rpc('calculate_teacher_payroll', { p_teacher_id: teacherId, p_month: new Date().getMonth() + 1, p_year: new Date().getFullYear() }).then((r: any) => r.data?.hours ?? 0),
        (supabase as any).rpc('calculate_teacher_payroll', { p_teacher_id: teacherId, p_month: new Date().getMonth() + 1, p_year: new Date().getFullYear() }).then((r: any) => r.data?.total ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'present').then((r: any) => r.count ?? 0),
        (supabase as any).from('course_enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active').then((r: any) => r.count ?? 0),
        (supabase as any).from('course_enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active').then((r: any) => r.count ?? 0),
      ]);
      return {
        todayClasses, studentsToday, attendanceRate, absentStudents: absent,
        upcomingClasses: upcoming, assignmentsPending: assignments, resourcesUploaded: resources,
        teachingHoursMonth: hours, revenueMonth: revenue, completedLessons: completed,
        privateLessonsToday: privateLessons, vipSessionsToday: vip,
      } as TeacherKpi;
    },
    enabled: !!teacherId,
    staleTime: 15_000,
  });

  const todayClassesQuery = useQuery({
    queryKey: ['teacher_today_classes', teacherId, dayName],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } = await (supabase as any)
        .from('course_schedules')
        .select('id, start_time, end_time, course:courses!inner(name, current_enrollments), room:rooms(name)')
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayName)
        .order('start_time');
      return (data ?? []).map((r: any) => ({
        id: r.id,
        courseName: r.course?.name ?? '',
        groupName: '',
        roomName: r.room?.name ?? '',
        startTime: r.start_time ?? '',
        endTime: r.end_time ?? '',
        studentCount: r.course?.current_enrollments ?? 0,
        status: 'scheduled',
      })) as TodayClass[];
    },
    enabled: !!teacherId,
    staleTime: 30_000,
  });

  const isLoading = kpiQuery.isLoading;
  const isError = kpiQuery.isError;

  return {
    kpi: kpiQuery.data ?? {
      todayClasses: 0, studentsToday: 0, attendanceRate: 0, absentStudents: 0,
      upcomingClasses: 0, assignmentsPending: 0, resourcesUploaded: 0,
      teachingHoursMonth: 0, revenueMonth: 0, completedLessons: 0,
      privateLessonsToday: 0, vipSessionsToday: 0,
    },
    todayClasses: todayClassesQuery.data ?? [],
    isLoading,
    isError,
  };
}