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
  const today = new Date().toISOString().split('T')[0];
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

  const kpiQuery = useQuery({
    queryKey: ['teacher_dashboard_kpi', teacherId],
    queryFn: async () => {
      if (!teacherId) return {} as TeacherKpi;
      const [todayClasses, studentsToday, attendanceRate, absent, upcoming, assignments, resources, hours, revenue, completed, privateLessons, vip] = await Promise.all([
        (supabase as any).from('course_schedules').select('id', { count: 'exact' }).eq('teacher_id', teacherId).eq('day_of_week', dayName).then(r => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact' }).eq('date', today).then(r => r.count ?? 0),
        (supabase as any).rpc('get_dashboard_stats', { stat: 'attendance_rate' }).then(r => r.data ?? 0).catch(() => 0),
        (supabase as any).from('attendance').select('id', { count: 'exact' }).eq('date', today).eq('status', 'absent').then(r => r.count ?? 0),
        (supabase as any).from('course_schedules').select('id', { count: 'exact' }).eq('teacher_id', teacherId).gte('start_time', '12:00').then(r => r.count ?? 0),
        (supabase as any).from('assignments').select('id', { count: 'exact' }).eq('teacher_id', teacherId).is('due_date', null).then(r => r.count ?? 0).catch(() => 0),
        (supabase as any).from('resources').select('id', { count: 'exact' }).eq('uploaded_by', teacherId).then(r => r.count ?? 0).catch(() => 0),
        (supabase as any).rpc('calculate_teacher_payroll', { p_teacher_id: teacherId, p_month: new Date().getMonth() + 1, p_year: new Date().getFullYear() }).then(r => r.data?.hours ?? 0).catch(() => 0),
        (supabase as any).rpc('calculate_teacher_payroll', { p_teacher_id: teacherId, p_month: new Date().getMonth() + 1, p_year: new Date().getFullYear() }).then(r => r.data?.total ?? 0).catch(() => 0),
        (supabase as any).from('attendance').select('id', { count: 'exact' }).eq('status', 'present').then(r => r.count ?? 0),
        (supabase as any).from('course_enrollments').select('id', { count: 'exact' }).eq('status', 'active').then(r => r.count ?? 0),
        (supabase as any).from('course_enrollments').select('id', { count: 'exact' }).eq('status', 'active').then(r => r.count ?? 0),
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