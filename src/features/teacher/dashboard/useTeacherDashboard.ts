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

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const kpiQuery = useQuery({
    queryKey: ['teacher_dashboard_kpi', teacherId, today],
    queryFn: async () => {
      if (!teacherId) return null;

      const { data: scheduleList } = await supabase
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time')
        .eq('teacher_id', teacherId);

      const allScheduleIds = (scheduleList ?? []).filter((s: any) => s.id).map((s: any) => s.id);
      const todayScheduleIds = (scheduleList ?? []).filter((s: any) => s.day_of_week === dayName && s.id).map((s: any) => s.id);
      const validAll = allScheduleIds.length > 0 ? allScheduleIds : [-1];
      const validToday = todayScheduleIds.length > 0 ? todayScheduleIds : [-1];

      const safe = (p: PromiseLike<any>) => Promise.resolve(p).catch(() => 0);
      const safeArr = (p: PromiseLike<any>) => Promise.resolve(p).then((r: any) => r.data ?? []).catch(() => []);

      const [teacherAssignmentIds] = await Promise.all([
        safeArr(supabase.from('assignments').select('id').eq('teacher_id', teacherId).then((r: any) => ({ data: (r.data ?? []).map((a: any) => a.id) }))),
      ]);
      const validAssignments = teacherAssignmentIds.length > 0 ? teacherAssignmentIds : [-1];

      const [todayClasses, studentsToday, absent, upcoming, assignmentsToGrade, resources, completed, privateLessons, vip, teachingHours, revenue] = await Promise.all([
        safe(supabase.from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('day_of_week', dayName).then((r: any) => r.count ?? 0)),
        safe(supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).in('course_schedule_id', validToday).then((r: any) => r.count ?? 0)),
        safe(supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'absent').in('course_schedule_id', validToday).then((r: any) => r.count ?? 0)),
        safe(supabase.from('course_schedules').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('day_of_week', dayName).gte('start_time', currentTime).then((r: any) => r.count ?? 0)),
        safe(supabase.from('assignment_submissions').select('id', { count: 'exact', head: true }).is('grade', null).neq('status', 'pending').in('assignment_id', validAssignments).then((r: any) => r.count ?? 0)),
        safe(supabase.from('resources' as never).select('id', { count: 'exact', head: true }).eq('uploaded_by' as never, teacherId).then((r: any) => r.count ?? 0)),
        safe(supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'present').in('course_schedule_id', validAll).then((r: any) => r.count ?? 0)),
        safe(supabase.from('private_lessons' as never).select('id', { count: 'exact', head: true }).eq('teacher_id' as never, teacherId).eq('date' as never, today).then((r: any) => r.count ?? 0)),
        safe(supabase.from('vip_classes' as never).select('id', { count: 'exact', head: true }).eq('teacher_id' as never, teacherId).eq('date' as never, today).then((r: any) => r.count ?? 0)),
        safeArr(supabase.from('course_schedules').select('day_of_week, start_time, end_time').eq('teacher_id', teacherId).then((r: any) => {
          const data = r.data ?? [];
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          let totalHours = 0;
          data.forEach((s: any) => {
            let occurrences = 0;
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(now.getFullYear(), now.getMonth(), d);
              if (date > now) break;
              const dow = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
              if (dow === s.day_of_week) occurrences++;
            }
            if (occurrences > 0) {
              const start = s.start_time ?? '00:00';
              const end = s.end_time ?? '00:00';
              const [sh, sm] = start.split(':').map(Number);
              const [eh, em] = end.split(':').map(Number);
              const durationHours = Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) / 60;
              totalHours += durationHours * occurrences;
            }
          });
          return { data: [totalHours] };
        }).then((r: any) => r.data[0])),
        safeArr(supabase.from('payments' as never).select('amount').eq('teacher_id' as never, teacherId).gte('created_at' as never, `${monthStart}T00:00:00`).lte('created_at' as never, `${today}T23:59:59`).then((r: any) => {
          const total = (r.data ?? []).reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
          return { data: [total] };
        }).then((r: any) => r.data[0])),
      ]);

      const presentCount = studentsToday - absent;
      const attendanceRate = studentsToday > 0 ? Math.round((presentCount / studentsToday) * 100) : 0;

      return {
        todayClasses, studentsToday, attendanceRate, absentStudents: absent,
        upcomingClasses: upcoming, assignmentsPending: assignmentsToGrade, resourcesUploaded: resources,
        teachingHoursMonth: teachingHours, revenueMonth: revenue, completedLessons: completed,
        privateLessonsToday: privateLessons, vipSessionsToday: vip,
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