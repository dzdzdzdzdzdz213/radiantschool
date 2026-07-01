import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*').is('deleted_at', null).order('created_at', { ascending: false });
      return data ?? [];
    },
  });
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*, students(*)')
        .eq('role', 'student')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream)')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream), schedules:course_schedules(*)')
        .eq('id', id)
        .single();
      return data;
    },
    enabled: !!id,
  });
}

export function useCourseEnrollments(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_enrollments')
        .select('*, student:users(first_name, last_name, email, phone)')
        .eq('course_id', courseId);
      return data ?? [];
    },
    enabled: !!courseId,
  });
}

export function useAttendance(date?: string, courseId?: number) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['attendance', date, courseId],
    queryFn: async () => {
      let query = supabase.from('attendance').select('*, student:users(first_name, last_name), schedule:course_schedules!inner(course_id, day_of_week, start_time, end_time)');
      if (profile?.role === 'teacher') {
        query = query.eq('schedule.teacher_id', profile.id);
      }
      if (date) query = query.eq('date', date);
      if (courseId) query = query.eq('schedule.course_id', courseId);
      const { data } = await query.order('created_at', { ascending: false }).limit(100);
      return data ?? [];
    },
    enabled: !!profile,
  });
}

export function usePayments(studentId?: string) {
  return useQuery({
    queryKey: ['payments', studentId],
    queryFn: async () => {
      let query = supabase.from('payments').select('*, student:users(first_name, last_name)').order('created_at', { ascending: false });
      if (studentId) query = query.eq('student_id', studentId);
      const { data } = await query.limit(100);
      return data ?? [];
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*, student:users(first_name, last_name)').order('created_at', { ascending: false }).limit(100);
      return data ?? [];
    },
  });
}

export function useDashboardKPI() {
  return useQuery({
    queryKey: ['dashboard_kpi'],
    queryFn: async () => {
      const { data } = await supabase.from('dashboard_kpi').select('*').single();
      return data;
    },
  });
}

export function useNotifications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });
}

export function useMessages() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['messages', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('messages')
        .select('*, sender:users!sender_id(first_name, last_name), receiver:users!receiver_id(first_name, last_name)')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });
}

export function useLevels() {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await supabase.from('levels').select('*').order('sort_order');
      return data ?? [];
    },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*').order('name');
      return data ?? [];
    },
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await supabase.from('rooms').select('*').eq('status', 'active').order('name');
      return data ?? [];
    },
  });
}

export function useRevenueChartData() {
  return useQuery({
    queryKey: ['revenue_chart'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase
        .from('payments')
        .select('amount, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');
      if (!data) return [];
      const dailyMap = new Map<string, number>();
      data.forEach(p => {
        const day = p.created_at.split('T')[0];
        dailyMap.set(day, (dailyMap.get(day) || 0) + p.amount);
      });
      const result: { date: string; amount: number }[] = [];
      const start = new Date(thirtyDaysAgo);
      const end = new Date();
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        result.push({ date: dateStr, amount: dailyMap.get(dateStr) || 0 });
      }
      return result;
    },
  });
}

export function useOccupancyData() {
  return useQuery({
    queryKey: ['occupancy'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('name, current_enrollments, capacity, room:rooms(name)')
        .not('room_id', 'is', null)
        .eq('status', 'active');
      return data ?? [];
    },
  });
}

export function useTodaySchedule() {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[new Date().getDay()];
  return useQuery({
    queryKey: ['today_schedule', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_schedules')
        .select(`
          id, start_time, end_time,
          course:courses(name, room:rooms(name)),
          teacher:users(first_name, last_name)
        `)
        .eq('day_of_week', today)
        .order('start_time');
      return data ?? [];
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent_activity'],
    queryFn: async () => {
      const [enrRes, payRes, attRes] = await Promise.all([
        supabase.from('course_enrollments')
          .select('enrollment_date, student:users(first_name,last_name), course:courses(name)')
          .order('enrollment_date', { ascending: false }).limit(5),
        supabase.from('payments')
          .select('amount, created_at, student:users!student_id(first_name,last_name)')
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('attendance')
          .select('date, status, student:users(first_name,last_name), schedule:course_schedules!inner(course:courses(name))')
          .order('created_at', { ascending: false }).limit(5),
      ]);
      const items: { time: string; icon: string; title: string; description: string }[] = [
        ...(enrRes.data?.map(e => ({ time: e.enrollment_date, icon: '📝', title: `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`, description: `Inscrit en ${e.course?.name ?? ''}` })) ?? []),
        ...(payRes.data?.map(p => ({ time: p.created_at, icon: '💰', title: `${p.student?.first_name ?? ''} ${p.student?.last_name ?? ''}`, description: `Paiement ${p.amount.toLocaleString()} DA` })) ?? []),
        ...(attRes.data?.map(a => ({ time: a.date, icon: a.status === 'present' ? '✅' : a.status === 'late' ? '⏰' : '❌', title: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`, description: `${a.status === 'present' ? 'Présent' : a.status === 'late' ? 'Retard' : 'Absent'} — ${a.schedule?.course?.name ?? ''}` })) ?? []),
      ];
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, 10);
    },
  });
}

export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin_alerts'],
    queryFn: async () => {
      const { count: pendingCount } = await supabase
        .from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { data: overdueInvoices } = await supabase
        .from('invoices').select('id, total_amount, paid_amount, due_date, student:users(first_name,last_name)')
        .in('status', ['unpaid', 'partially_paid'])
        .lt('due_date', new Date().toISOString())
        .order('due_date').limit(5);
      const { data: allCourses } = await supabase
        .from('courses').select('id, name, current_enrollments, capacity').eq('status', 'active');
      const nearFull = (allCourses ?? []).filter(c => c.capacity > 0 && (c.current_enrollments / c.capacity) >= 0.8);
      const { data: criticalNotifs } = await supabase
        .from('notifications').select('*')
        .in('type', ['warning', 'error'])
        .order('created_at', { ascending: false }).limit(5);
      return { pendingApprovals: pendingCount ?? 0, overdueInvoices: overdueInvoices ?? [], nearFullCourses: nearFull, criticalNotifications: criticalNotifs ?? [] };
    },
  });
}
