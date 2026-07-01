import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  studentType: string | null;
  levelName: string | null;
  courseCount: number;
  createdAt: string;
}

export function useStudents(search: string = '', page: number = 1, pageSize: number = 20, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['assistant_students', search, page, pageSize, filters],
    queryFn: async () => {
      const params: any = {
        pagination: { page, pageSize },
        sort: [{ column: 'created_at', direction: 'desc' as const }],
        filters: [{ column: 'role', operator: 'eq' as const, value: 'student' }, { column: 'deleted_at', operator: 'is' as const, value: null }],
      };
      if (filters?.status) params.filters.push({ column: 'status', operator: 'eq', value: filters.status });
      if (filters?.studentType) params.filters.push({ column: 'student_type', operator: 'eq', value: filters.studentType });
      if (search) { params.search = search; params.searchColumns = ['first_name', 'last_name', 'email']; }
      const result = await api.list<any>('users', params, 'id, first_name, last_name, email, phone, status, student_type, created_at');
      const data = result.data.map((r: any) => ({
        id: r.id,
        firstName: r.first_name ?? '',
        lastName: r.last_name ?? '',
        email: r.email ?? '',
        phone: r.phone ?? null,
        status: r.status ?? '',
        studentType: r.student_type ?? null,
        levelName: r.level_name ?? null,
        courseCount: r.course_count ?? 0,
        createdAt: r.created_at ?? '',
      })) as StudentListItem[];
      return { data, meta: result.meta };
    },
    staleTime: 10_000,
  });
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: ['assistant_student', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*, students!inner(*), levels(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return api.create('users', data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_students'] }); },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.update('users', id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_students'] }); },
  });
}