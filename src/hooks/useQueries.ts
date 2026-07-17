import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api, type FilterParams } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.list('users', { pagination: { page: 1, pageSize: 500 }, sort: [{ column: 'created_at', direction: 'desc' }] }, '*, students(*)').then(r => r.data),
    staleTime: 120_000,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.list('courses', { sort: [{ column: 'created_at', direction: 'desc' }] }, '*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream, year), schedules:course_schedules(id, day_of_week, start_time, end_time)').then(r => r.data),
    staleTime: 30_000,
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: (): Promise<any> => api.get('courses', id, '*, subject:subjects(name), teacher:users(first_name, last_name), room:rooms(name), level:levels(name, category, stream), schedules:course_schedules(*)'),
    enabled: !!id,
    staleTime: 120_000,
  });
}

export function useCourseEnrollments(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () => api.list('course_enrollments', { filters: [{ column: 'course_id', operator: 'eq', value: courseId }] }, '*, student:students!student_id(user:users!students_id_fkey(first_name, last_name, email, phone))').then(r => r.data),
    staleTime: 120_000,
    enabled: !!courseId,
  });
}

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

export function useMessages() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['messages', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:users!sender_id(first_name, last_name), receiver:users!receiver_id(first_name, last_name)')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.id,
    staleTime: 30_000,
  });
}

export function useLevels() {
  return useQuery({
    queryKey: ['levels'],
    queryFn: () => api.list('levels', { sort: [{ column: 'sort_order', direction: 'asc' }] }).then(r => r.data),
    staleTime: 600_000,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.list('subjects', { sort: [{ column: 'name', direction: 'asc' }] }).then(r => r.data),
    staleTime: 600_000,
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.list('rooms', { filters: [{ column: 'status', operator: 'eq', value: 'available' }], sort: [{ column: 'name', direction: 'asc' }] }).then(r => r.data),
    staleTime: 300_000,
  });
}
