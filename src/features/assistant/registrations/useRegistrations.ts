import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface RegistrationItem {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  status: string;
  enrollmentDate: string;
  campaignName: string | null;
}

export function useRegistrations(search: string = '', page: number = 1, statusFilter: string = '') {
  return useQuery({
    queryKey: ['assistant_registrations', search, page, statusFilter],
    queryFn: async () => {
      const { data, count } = await (supabase as any)
        .from('course_enrollments')
        .select('id, status, enrollment_date, student:users!student_id(first_name, last_name, id), course:courses(id, name), campaign:campaigns(name)', { count: 'exact' })
        .order('enrollment_date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      const items = (data ?? []).map((r: any) => ({
        id: r.id,
        studentId: r.student?.id ?? '',
        studentName: r.student ? `${r.student.first_name ?? ''} ${r.student.last_name ?? ''}` : 'Inconnu',
        courseId: r.course?.id ?? '',
        courseName: r.course?.name ?? 'Inconnu',
        status: r.status,
        enrollmentDate: r.enrollment_date,
        campaignName: r.campaign?.name ?? null,
      })) as RegistrationItem[];
      return { data: items, meta: { page, pageSize: 20, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / 20) } };
    },
    staleTime: 10_000,
  });
}

export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.rpc('approve_enrollment', { enrollment_id: id });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_registrations'] }); },
  });
}

export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.update('course_enrollments', id, { status: 'rejected' });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_registrations'] }); },
  });
}