import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

/** Active courses with subject, level, teacher, room, and schedules for the public landing page. Stale after 5 min. */
export function usePublicCourses() {
  const query = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select(`
          id, name, type, capacity, current_enrollments, price, status, start_date, end_date, image_url,
          subject:subjects(name),
          level:levels(name, category, stream, year),
          teacher:users!teacher_id(id, first_name, last_name, accepts_private_lessons),
          room:rooms(name),
          schedules:course_schedules(id, day_of_week, start_time, end_time)
        `)
        .in('status', ['active'])
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel('public-courses-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'courses' }, () => {
        queryClient.invalidateQueries({ queryKey: ['public-courses'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

/**
 * Aggregated public statistics for the landing page: student count,
 * teacher count, average rating, success rate, years active, and more.
 * Stale after 5 min.
 */
export interface PublicStats {
  studentCount: number;
  teacherCount: number;
  avgRating: number;
  successRate: number;
  yearsActive: number;
  totalEvaluations: number;
  maxCapacity: number;
  typeCount: number;
  levelCount: number;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      const [statsRes, courseRes, typeRes] = await Promise.all([
        (supabase.rpc as (name: string, args?: Record<string, unknown>) => { data: unknown } | PromiseLike<{ data: unknown }>)('get_public_stats'),
        supabase.from('courses').select('capacity').eq('status', 'active'),
        supabase.from('courses').select('type').eq('status', 'active'),
      ]);
      const stats = (statsRes.data ?? {}) as Record<string, number>;
      const studentCount = stats.student_count ?? 0;
      const teacherCount = stats.teacher_count ?? 0;
      const avgRating = stats.avg_rating ?? 0;
      const successRate = stats.success_rate ?? 0;
      const totalEvaluations = stats.total_evaluations ?? 0;
      const { data: levelCategories } = await supabase.from('levels').select('category').not('category', 'is', null);
      const levelCount = new Set((levelCategories ?? []).map(r => r.category)).size;
      const firstCourse = await supabase.from('courses').select('start_date').eq('status', 'active').order('start_date', { ascending: true }).limit(1).maybeSingle();
      const yearsActive = firstCourse.data?.start_date
        ? Math.max(1, new Date().getFullYear() - new Date(firstCourse.data.start_date).getFullYear())
        : 5;
      const capacities = (courseRes.data ?? []).map(r => r.capacity).filter(Boolean) as number[];
      const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : 0;
      const types = new Set((typeRes.data ?? []).map(r => r.type).filter(Boolean));
      const typeCount = types.size;
      return { studentCount, avgRating, successRate, yearsActive, totalEvaluations, teacherCount, maxCapacity, typeCount, levelCount };
    },
    staleTime: 1000 * 60 * 5,
  });
}
