import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboardKPI() {
  return useQuery({
    queryKey: ['dashboard_kpi'],
    queryFn: () => api.list('dashboard_kpi').then(r => r.data?.[0] ?? null),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

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

export function useOccupancyData() {
  return useQuery({
    queryKey: ['occupancy'],
    queryFn: () => api.list('courses', { filters: [{ column: 'status', operator: 'eq', value: 'active' }] }, 'name, current_enrollments, capacity, room_id, room:rooms(name)').then(r => r.data.filter((c: any) => c.room_id != null)),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
  });
}

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

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent_activity'],
    queryFn: async () => {
      const [enrRes, payRes, attRes] = await Promise.all([
        api.list('course_enrollments', { sort: [{ column: 'enrollment_date', direction: 'desc' }] }, 'enrollment_date, student:students!student_id(user:users!students_id_fkey(first_name,last_name)), course:courses(name)'),
        api.list('payments', { sort: [{ column: 'created_at', direction: 'desc' }] }, 'amount, created_at, student:students!student_id(user:users!students_id_fkey(first_name,last_name))'),
        api.list('attendance', { sort: [{ column: 'created_at', direction: 'desc' }] }, 'date, status, student:students!student_id(user:users!students_id_fkey(first_name,last_name)), schedule:course_schedules!inner(course:courses(name))'),
      ]);
      const items: { time: string; icon: string; title: string; description: string }[] = [
        ...(enrRes.data?.slice(0, 5).map((e: any) => ({ time: e.enrollment_date, icon: '📝', title: `${e.student?.user?.first_name ?? ''} ${e.student?.user?.last_name ?? ''}`, description: `Inscrit en ${e.course?.name ?? ''}` })) ?? []),
        ...(payRes.data?.slice(0, 5).map((p: any) => ({ time: p.created_at, icon: '💰', title: `${p.student?.user?.first_name ?? ''} ${p.student?.user?.last_name ?? ''}`, description: `Paiement ${p.amount.toLocaleString()} DA` })) ?? []),
        ...(attRes.data?.slice(0, 5).map((a: any) => ({ time: a.date, icon: a.status === 'present' ? '✅' : a.status === 'late' ? '⏰' : '❌', title: `${a.student?.user?.first_name ?? ''} ${a.student?.user?.last_name ?? ''}`, description: `${a.status === 'present' ? 'Présent' : a.status === 'late' ? 'Retard' : 'Absent'} — ${a.schedule?.course?.name ?? ''}` })) ?? []),
      ];
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, 10);
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

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
        }, 'id, total_amount, paid_amount, due_date, student:students!student_id(user:users!students_id_fkey(first_name,last_name))'),
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
