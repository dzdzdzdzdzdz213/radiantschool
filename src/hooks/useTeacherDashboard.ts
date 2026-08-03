import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getDayName(): (typeof DAYS)[number] {
  return DAYS[new Date().getDay()];
}

export function useTeacherDashboard(teacherId: string | undefined) {
  const todayDayName = getDayName();

  const kpiQuery = useQuery({
    queryKey: ['teacher-kpi', teacherId],
    queryFn: async () => {
      if (!teacherId) return { courseCount: 0, scheduleCount: 0, studentCount: 0, attendanceToday: 0 };

      const [coursesRes, schedRes, studentsRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).in('status', ['active']),
        supabase.from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId),
        supabase.from('course_enrollments').select('student_id')
          .in('course_id', (await supabase.from('courses').select('id').eq('teacher_id', teacherId).in('status', ['active'])).data?.map(c => c.id) ?? []),
      ]);

      const uniqueStudents = new Set((studentsRes.data ?? []).map((r) => r.student_id));

      const courseIdList = (coursesRes.data ?? []).map(c => c.id);
      let attendanceToday = 0;
      if (courseIdList.length > 0) {
        const { data: sessions } = await supabase.from('attendance_sessions').select('id').in('course_id', courseIdList);
        const sessionIds = (sessions ?? []).map(s => s.id);
        if (sessionIds.length > 0) {
          const { count } = await supabase.from('attendance_records').select('id', { count: 'exact', head: true })
            .in('session_id', sessionIds);
          attendanceToday = count ?? 0;
        }
      }

      return {
        courseCount: coursesRes.count ?? 0,
        scheduleCount: schedRes.count ?? 0,
        studentCount: uniqueStudents.size,
        attendanceToday,
      };
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 2,
  });

  const todayScheduleQuery = useQuery({
    queryKey: ['teacher-today-schedule', teacherId, todayDayName],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } = await supabase
        .from('course_schedules')
        .select(`
          id, start_time, end_time,
          course:courses!course_id(id, name, type),
          room:rooms(name)
        `)
        .eq('teacher_id', teacherId)
        .eq('day_of_week', todayDayName)
        .order('start_time');
      return data ?? [];
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 2,
  });

  const upcomingCoursesQuery = useQuery({
    queryKey: ['teacher-upcoming-courses', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } = await supabase
        .from('courses')
        .select(`
          id, name, type, current_enrollments, capacity, start_date, end_date,
          subject:subjects(name),
          level:levels(name, stream),
          schedules:course_schedules(id, day_of_week, start_time, end_time)
        `)
        .eq('teacher_id', teacherId)
        .in('status', ['active'])
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 2,
  });

  const recentEnrollmentsQuery = useQuery({
    queryKey: ['teacher-recent-enrollments', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data: courseIds } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', teacherId);

      if (!courseIds?.length) return [];

      const { data } = await supabase
        .from('course_enrollments')
        .select(`
          id, enrollment_date,
          student:students!student_id(user:users!students_id_fkey(first_name, last_name)),
          course:courses!course_id(name)
        `)
        .in('course_id', courseIds.map(c => c.id))
        .order('enrollment_date', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 2,
  });

  return {
    kpi: kpiQuery.data ?? { courseCount: 0, scheduleCount: 0, studentCount: 0, attendanceToday: 0 },
    todaySchedule: todayScheduleQuery.data ?? [],
    upcomingCourses: upcomingCoursesQuery.data ?? [],
    recentEnrollments: recentEnrollmentsQuery.data ?? [],
    isLoading: kpiQuery.isLoading || todayScheduleQuery.isLoading || upcomingCoursesQuery.isLoading || recentEnrollmentsQuery.isLoading,
    isError: kpiQuery.isError || todayScheduleQuery.isError || upcomingCoursesQuery.isError || recentEnrollmentsQuery.isError,
  };
}
