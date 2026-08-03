import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export function useTeachersBySubject(subjectName: string | null) {
  return useQuery({
    queryKey: ['teachers-by-subject', subjectName],
    queryFn: async () => {
      if (!subjectName) return [];
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .ilike('name', subjectName)
        .maybeSingle();
      if (!subject) return [];
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          teacher_id,
          teacher:users!teacher_id(id, first_name, last_name, photo_url, created_at)
        `)
        .eq('subject_id', subject.id)
        .eq('status', 'active');
      if (!courses) return [];
      const teacherMap = new Map<string, NonNullable<(typeof courses)[number]['teacher']>>();
      for (const c of courses) {
        if (c.teacher && !teacherMap.has(c.teacher.id)) {
          teacherMap.set(c.teacher.id, c.teacher);
        }
      }
      const teachers = Array.from(teacherMap.values());
      const { data: teacherBios } = await supabase
        .from('teachers')
        .select('id, biography')
        .in('id', teachers.map((t) => t.id));
      const bioMap = new Map((teacherBios ?? []).map((b) => [b.id, b.biography]));
      const enriched = await Promise.all(
        teachers.map(async (t) => {
          const { count: courseCount } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', t.id)
            .eq('status', 'active');
          const { data: courseIds } = await supabase
            .from('courses')
            .select('id')
            .eq('teacher_id', t.id)
            .eq('status', 'active');
          let studentCount = 0;
          if (courseIds && courseIds.length > 0) {
            const { count } = await supabase
              .from('course_enrollments')
              .select('student_id', { count: 'exact', head: true })
              .in('course_id', courseIds.map(c => c.id));
            studentCount = count ?? 0;
          }
          const { data: reviews } = await supabase
            .from('evaluations')
            .select('average_score')
            .eq('teacher_id', t.id);
          const avgRating = reviews?.length
            ? reviews.reduce((s, r) => s + (r.average_score ?? 0), 0) / reviews.length
            : 0;
          const yearsActive = t.created_at
            ? Math.max(1, Math.floor((Date.now() - new Date(t.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
            : 1;
          return { ...t, biography: bioMap.get(t.id) ?? null, courseCount, studentCount, avgRating, yearsActive };
        }),
      );
      return enriched;
    },
    enabled: !!subjectName,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherProfile(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-public-profile', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const { data: teacher } = await supabase
        .from('users')
        .select('*')
        .eq('id', teacherId)
        .single();
      if (!teacher) return null;
      const { data: teacherProfile } = await supabase
        .from('teachers')
        .select('biography')
        .eq('id', teacherId)
        .maybeSingle();
      const biography = teacherProfile?.biography ?? null;
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'active');
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name, subject:subjects(name), level:levels(name, category, stream, year), price, type, capacity, current_enrollments')
        .eq('teacher_id', teacherId)
        .eq('status', 'active');
      const courseIds = courses?.map(c => c.id) ?? [];
      let studentCount = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('course_enrollments')
          .select('student_id', { count: 'exact', head: true })
          .in('course_id', courseIds);
        studentCount = count ?? 0;
      }
      const { data: schedules } = await supabase
        .from('course_schedules')
        .select('id, day_of_week, start_time, end_time, course_id')
        .in('course_id', courseIds);
      const { data: reviews } = await supabase
        .from('evaluations')
        .select('average_score, comment, created_at, student_id')
        .eq('teacher_id', teacherId);
      const avgRating = reviews?.length
        ? reviews.reduce((s, r) => s + (r.average_score ?? 0), 0) / reviews.length
        : 0;
      const yearsActive = teacher.created_at
        ? Math.max(1, Math.floor((Date.now() - new Date(teacher.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
        : 1;
      return {
        ...teacher,
        biography,
        courseCount,
        studentCount,
        avgRating,
        yearsActive,
        courses: courses ?? [],
        schedules: schedules ?? [],
        reviews: reviews ?? [],
      };
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}
