import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePublicCourses() {
  return useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select(`
          id, name, type, capacity, current_enrollments, price, status, start_date, end_date,
          subject:subjects(name),
          level:levels(name, category, stream),
          teacher:users!teacher_id(first_name, last_name),
          room:rooms(name),
          schedules:course_schedules(id, day_of_week, start_time, end_time)
        `)
        .in('status', ['active'])
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const [studentRes, evalRes, teacherRes, courseRes, typeRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').is('deleted_at', null),
        supabase.from('evaluations').select('average_score'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher').is('deleted_at', null),
        supabase.from('courses').select('capacity').eq('status', 'active'),
        supabase.from('courses').select('type').eq('status', 'active'),
      ]);
      const studentCount = studentRes.count ?? 0;
      const teacherCount = teacherRes.count ?? 0;
      const scores = (evalRes.data ?? []).map(r => r.average_score).filter(Boolean) as number[];
      const avgRating = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const successRate = scores.length > 0 ? Math.round((scores.filter(s => s >= 3).length / scores.length) * 100) : 0;
      const firstCourse = await supabase.from('courses').select('start_date').eq('status', 'active').order('start_date', { ascending: true }).limit(1).maybeSingle();
      const yearsActive = firstCourse.data?.start_date
        ? Math.max(1, new Date().getFullYear() - new Date(firstCourse.data.start_date).getFullYear())
        : 5;
      const capacities = (courseRes.data ?? []).map(r => r.capacity).filter(Boolean) as number[];
      const minCapacity = capacities.length > 0 ? Math.min(...capacities) : 0;
      const types = new Set((typeRes.data ?? []).map(r => r.type).filter(Boolean));
      const typeCount = types.size;
      return { studentCount, avgRating, successRate, yearsActive, totalEvaluations: scores.length, teacherCount, minCapacity, typeCount };
    },
    staleTime: 1000 * 60 * 5,
  });
}
