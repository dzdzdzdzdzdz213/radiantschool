import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

/** All users with their student profile relation. Sorted by newest first. */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.list('users', { sort: [{ column: 'created_at', direction: 'desc' }] }, '*, students(*)').then(r => r.data),
    staleTime: 120_000,
  });
}

/** All users with role `student`, including the `students` relation. */
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.list('users', { filters: [{ column: 'role', operator: 'eq', value: 'student' }], sort: [{ column: 'created_at', direction: 'desc' }] }, '*, students(*)').then(r => r.data),
    staleTime: 120_000,
  });
}

/** All courses with subject, teacher, room, and level relations. */
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.list('courses', { sort: [{ column: 'created_at', direction: 'desc' }] }, '*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream)').then(r => r.data),
    staleTime: 120_000,
  });
}

/** Single course by ID with relations and schedules. Disabled when `id` is falsy. */
export function useCourse(id: number) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get('courses', id, '*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream), schedules:course_schedules(*)'),
    enabled: !!id,
    staleTime: 120_000,
  });
}

/** Enrollments for a specific course, including student details. */
export function useCourseEnrollments(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () => api.list('course_enrollments', { filters: [{ column: 'course_id', operator: 'eq', value: courseId }] }, '*, student:users(first_name, last_name, email, phone)').then(r => r.data),
    staleTime: 120_000,
    enabled: !!courseId,
  });
}

/**
 * Attendance records filtered by optional date and course.
 * When the current user is a teacher, filters to only their course schedules.
 */
export function useAttendance(date?: string, courseId?: number) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['attendance', date, courseId],
    queryFn: async () => {
      const filters: any[] = [];
      if (date) filters.push({ column: 'date', operator: 'eq', value: date });
      if (courseId) filters.push({ column: 'course_schedule_id', operator: 'eq', value: courseId });
      const r = await api.list('attendance', { filters, sort: [{ column: 'date', direction: 'desc' }] }, '*, student:users(first_name, last_name), schedule:course_schedules!inner(course_id, day_of_week, start_time, end_time, teacher_id)');
      if (profile?.role === 'teacher') {
        return (r.data ?? []).filter((a: any) => a.schedule?.teacher_id === profile.id);
      }
      return r.data;
    },
    enabled: !!profile,
    staleTime: 60_000,
  });
}

/** Payments, optionally filtered by student. Includes student name relation. */
export function usePayments(studentId?: string) {
  return useQuery({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      const filters: any[] = [];
      if (studentId) filters.push({ column: 'student_id', operator: 'eq', value: studentId });
      const r = await api.list('payments', { filters, sort: [{ column: 'created_at', direction: 'desc' }] }, '*, student:users(first_name, last_name)');
      return r.data;
    },
    staleTime: 60_000,
  });
}

/** All invoices with student name relation, newest first. */
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.list('invoices', { sort: [{ column: 'created_at', direction: 'desc' }] }, '*, student:users(first_name, last_name)').then(r => r.data),
    staleTime: 120_000,
  });
}

/** Aggregated KPIs from the `dashboard_kpi` view. Stale after 60 s. */
export function useDashboardKPI() {
  return useQuery({
    queryKey: ['dashboard_kpi'],
    queryFn: () => api.list('dashboard_kpi').then(r => r.data?.[0] ?? null),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Current user's notifications, sorted by newest. Disabled when unauthenticated. */
export function useNotifications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const r = await api.list('notifications', { filters: [{ column: 'user_id', operator: 'eq', value: profile.id }], sort: [{ column: 'created_at', direction: 'desc' }] });
      return r.data;
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  });
}

/** Messages where the current user is sender or receiver. */
export function useMessages() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['messages', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const r = await api.list('messages', { sort: [{ column: 'created_at', direction: 'desc' }] }, '*, sender:users!sender_id(first_name, last_name), receiver:users!receiver_id(first_name, last_name)');
      return r.data.filter((m: any) => m.sender_id === profile.id || m.receiver_id === profile.id);
    },
    enabled: !!profile?.id,
  });
}

/** All academic levels, sorted by `sort_order`. Rarely changes. */
export function useLevels() {
  return useQuery({
    queryKey: ['levels'],
    queryFn: () => api.list('levels', { sort: [{ column: 'sort_order', direction: 'asc' }] }).then(r => r.data),
    staleTime: 600_000,
  });
}

/** All subjects, sorted alphabetically by name. Rarely changes. */
export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.list('subjects', { sort: [{ column: 'name', direction: 'asc' }] }).then(r => r.data),
    staleTime: 600_000,
  });
}

/** Active rooms sorted by name. */
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.list('rooms', { filters: [{ column: 'status', operator: 'eq', value: 'active' }], sort: [{ column: 'name', direction: 'asc' }] }).then(r => r.data),
    staleTime: 300_000,
  });
}

/** Daily revenue totals for the last 30 days as `{ date, amount }` pairs. Every day in the range is present (zero-filled). */
export function useRevenueChartData() {
  return useQuery({
    queryKey: ['revenue_chart'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const r = await api.list('payments', {
        filters: [{ column: 'created_at', operator: 'gte', value: thirtyDaysAgo.toISOString() }],
        sort: [{ column: 'created_at', direction: 'asc' }],
      });
      if (!r.data?.length) return [];
      const dailyMap = new Map<string, number>();
      r.data.forEach((p: any) => {
        const day = p.created_at.split('T')[0];
        dailyMap.set(day, (dailyMap.get(day) || 0) + p.amount);
      });
      const result: { date: string; amount: number }[] = [];
      const end = new Date();
      for (let d = new Date(thirtyDaysAgo); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        result.push({ date: dateStr, amount: dailyMap.get(dateStr) || 0 });
      }
      return result;
    },
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Active courses with room assignments: current enrollment vs capacity. */
export function useOccupancyData() {
  return useQuery({
    queryKey: ['occupancy'],
    queryFn: () => api.list('courses', { filters: [{ column: 'status', operator: 'eq', value: 'active' }] }, 'name, current_enrollments, capacity, room_id, room:rooms(name)').then(r => r.data.filter((c: any) => c.room_id != null)),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Today's course schedules with course, room, and teacher relations. */
export function useTodaySchedule() {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[new Date().getDay()];
  return useQuery({
    queryKey: ['today_schedule', today],
    queryFn: () => api.list('course_schedules', { filters: [{ column: 'day_of_week', operator: 'eq', value: today }], sort: [{ column: 'start_time', direction: 'asc' }] }, 'id, start_time, end_time, course:courses(name), room:rooms(name), teacher:users(first_name, last_name)').then(r => r.data),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Combined recent activity timeline: enrollments, payments, and attendance
 * merged and sorted by time, limited to the 10 most recent events.
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent_activity'],
    queryFn: async () => {
      const [enrRes, payRes, attRes] = await Promise.all([
        api.list('course_enrollments', { sort: [{ column: 'enrollment_date', direction: 'desc' }] }, 'enrollment_date, student:users(first_name,last_name), course:courses(name)'),
        api.list('payments', { sort: [{ column: 'created_at', direction: 'desc' }] }, 'amount, created_at, student:users!student_id(first_name,last_name)'),
        api.list('attendance', { sort: [{ column: 'created_at', direction: 'desc' }] }, 'date, status, student:users(first_name,last_name), schedule:course_schedules!inner(course:courses(name))'),
      ]);
      const items: { time: string; icon: string; title: string; description: string }[] = [
        ...(enrRes.data?.slice(0, 5).map((e: any) => ({ time: e.enrollment_date, icon: '📝', title: `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`, description: `Inscrit en ${e.course?.name ?? ''}` })) ?? []),
        ...(payRes.data?.slice(0, 5).map((p: any) => ({ time: p.created_at, icon: '💰', title: `${p.student?.first_name ?? ''} ${p.student?.last_name ?? ''}`, description: `Paiement ${p.amount.toLocaleString()} DA` })) ?? []),
        ...(attRes.data?.slice(0, 5).map((a: any) => ({ time: a.date, icon: a.status === 'present' ? '✅' : a.status === 'late' ? '⏰' : '❌', title: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`, description: `${a.status === 'present' ? 'Présent' : a.status === 'late' ? 'Retard' : 'Absent'} — ${a.schedule?.course?.name ?? ''}` })) ?? []),
      ];
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, 10);
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Admin alert dashboard data: pending user approvals, overdue invoices,
 * near-full courses (≥80 % capacity), and critical notifications.
 */
export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin_alerts'],
    queryFn: async () => {
      const [pendingRes, overdueRes, coursesRes, notifsRes] = await Promise.all([
        api.list('users', { filters: [{ column: 'status', operator: 'eq', value: 'pending' }] }),
        api.list('invoices', {
          filters: [
            { column: 'status', operator: 'in', value: ['unpaid', 'partially_paid'] },
          ],
          sort: [{ column: 'due_date', direction: 'asc' }],
        }, 'id, total_amount, paid_amount, due_date, student:users(first_name,last_name)'),
        api.list('courses', { filters: [{ column: 'status', operator: 'eq', value: 'active' }] }, 'id, name, current_enrollments, capacity'),
        api.list('notifications', {
          filters: [{ column: 'type', operator: 'in', value: ['warning', 'error'] }],
          sort: [{ column: 'created_at', direction: 'desc' }],
        }),
      ]);
      const nearFull = (coursesRes.data ?? []).filter((c: any) => c.capacity > 0 && (c.current_enrollments / c.capacity) >= 0.8);
      const overdueInvoices = overdueRes.data?.filter((i: any) => new Date(i.due_date) < new Date()) ?? [];
      return {
        pendingApprovals: pendingRes.meta.total,
        overdueInvoices,
        nearFullCourses: nearFull,
        criticalNotifications: notifsRes.data ?? [],
      };
    },
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}
