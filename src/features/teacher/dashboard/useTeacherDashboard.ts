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

      const { data: scheduleList } = await (supabase as any)
        .from('course_schedules')
        .select('id, day_of_week')
        .eq('teacher_id', teacherId);

      const allScheduleIds = (scheduleList ?? []).filter((s: any) => s.id).map((s: any) => s.id);
      const todayScheduleIds = (scheduleList ?? []).filter((s: any) => s.day_of_week === dayName && s.id).map((s: any) => s.id);
      const validAll = allScheduleIds.length > 0 ? allScheduleIds : [-1];
      const validToday = todayScheduleIds.length > 0 ? todayScheduleIds : [-1];

      const [todayClasses, studentsToday, absent, upcoming, assignments, resources, completed, privateLessons, vip] = await Promise.all([
        (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('day_of_week', dayName).then((r: any) => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).in('course_schedule_id', validToday).then((r: any) => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'absent').in('course_schedule_id', validToday).then((r: any) => r.count ?? 0),
        (supabase as any).from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('day_of_week', dayName).gte('start_time', currentTime).then((r: any) => r.count ?? 0),
        (supabase as any).from('assignments').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).is('due_date', null).then((r: any) => r.count ?? 0),
        (supabase as any).from('resources').select('id', { count: 'exact', head: true }).eq('uploaded_by', teacherId).then((r: any) => r.count ?? 0),
        (supabase as any).from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'present').in('course_schedule_id', validAll).then((r: any) => r.count ?? 0),
        (supabase as any).from('private_lessons').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('date', today).then((r: any) => r.count ?? 0),
        (supabase as any).from('vip_classes').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('date', today).then((r: any) => r.count ?? 0),
      ]);

      const totalPresent = todayClasses > 0 ? studentsToday : 0;
      const attendanceRate = totalPresent > 0 ? Math.round((totalPresent / (totalPresent + absent)) * 100) : 0;

      return {
        todayClasses, studentsToday, attendanceRate, absentStudents: absent,
        upcomingClasses: upcoming, assignmentsPending: assignments, resourcesUploaded: resources,
        teachingHoursMonth: 0, revenueMonth: 0, completedLessons: completed,
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

  const isLoading = kpiQuery.isLoading || todayClassesQuery.isLoading;
  const isError = kpiQuery.isError || todayClassesQuery.isError;

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