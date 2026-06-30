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
