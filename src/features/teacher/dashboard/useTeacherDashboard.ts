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
  id: number;
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
  const kpiQuery = useQuery({
    queryKey: ['teacher_dashboard_kpi', teacherId, today],
    queryFn: async () => {
      if (!teacherId) return null;

      const { data, error } = await supabase.rpc('get_teacher_dashboard_kpi', { p_teacher_id: teacherId });
      if (error || !data) return null;

      const kpi = data as unknown as Record<string, number>;
      const presentCount = (kpi.students_today ?? 0) - (kpi.absent_students ?? 0);
      const attendanceRate = (kpi.students_today ?? 0) > 0
        ? Math.round((presentCount / (kpi.students_today ?? 0)) * 100)
        : 0;

      return {
        todayClasses: kpi.today_classes ?? 0,
        studentsToday: kpi.students_today ?? 0,
        attendanceRate,
        absentStudents: kpi.absent_students ?? 0,
        upcomingClasses: kpi.upcoming_classes ?? 0,
        assignmentsPending: kpi.assignments_pending ?? 0,
        resourcesUploaded: kpi.resources_uploaded ?? 0,
        teachingHoursMonth: kpi.teaching_hours_month ?? 0,
        revenueMonth: kpi.revenue_month ?? 0,
        completedLessons: kpi.completed_lessons ?? 0,
        privateLessonsToday: kpi.private_lessons_today ?? 0,
        vipSessionsToday: kpi.vip_sessions_today ?? 0,
      };
    },
    enabled: !!teacherId,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });

  const todayClassesQuery = useQuery({
    queryKey: ['teacher_today_classes', teacherId, dayName],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select('id, start_time, end_time, course:courses!inner(name, current_enrollments), room:rooms(name)')
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayName)
        .order('start_time');
      return (data ?? []).map((r) => ({
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
    gcTime: 5 * 60 * 1000,
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