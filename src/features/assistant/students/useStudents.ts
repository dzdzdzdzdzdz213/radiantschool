import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api, type QueryParams } from '@/lib/api';
import type { Database } from '@/types/database';

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  studentType: string | null;
  createdAt: string;
}

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  students: { student_type: string | null } | null;
}

export function useStudents(search: string = '', page: number = 1, pageSize: number = 20, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['assistant_students', search, page, pageSize, filters],
    queryFn: async () => {
      const params: QueryParams = {
        pagination: { page, pageSize },
        sort: [{ column: 'created_at', direction: 'desc' }],
        filters: [{ column: 'role', operator: 'eq', value: 'student' }, { column: 'deleted_at', operator: 'is', value: null }],
      };
      if (filters?.status) params.filters!.push({ column: 'status', operator: 'eq', value: filters.status });
      if (search) { params.search = search; params.searchColumns = ['first_name', 'last_name', 'email']; }
      const result = await api.list<StudentRow>('users', params, 'id, first_name, last_name, email, phone, status, created_at, students(student_type)');
      const data = result.data.map((r) => ({
        id: r.id,
        firstName: r.first_name ?? '',
        lastName: r.last_name ?? '',
        email: r.email ?? '',
        phone: r.phone ?? null,
        status: r.status ?? '',
        studentType: r.students?.student_type ?? null,
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
      const { data, error } = await supabase
        .from('users')
        .select('*, students(*, level:levels(name))')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Not found');
      return data;
    },
    enabled: !!id,
  });
}

export interface StudentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  status: string;
  role?: string;
  password: string;
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ first_name, last_name, email, phone, status, role = 'student', password }: StudentInput) => {
      const { data: { session: prevSession } } = await supabase.auth.getSession();
      const { data: signUpRes, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name, last_name, role } },
      });
      if (signUpError) throw signUpError;
      if (!signUpRes?.user) throw new Error('Aucun utilisateur créé');
      if (signUpRes.session && prevSession) {
        await supabase.auth.setSession({ access_token: prevSession.access_token, refresh_token: prevSession.refresh_token });
      }
      const { error: rpcError } = await supabase.rpc('register_user', {
        p_id: signUpRes.user.id,
        p_email: email,
        p_first_name: first_name,
        p_last_name: last_name,
        p_role: role,
        p_status: status,
        p_phone: phone ?? undefined,
      });
      if (rpcError) throw new Error(rpcError.message || rpcError.hint || 'Erreur lors de la création du profil');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_students'] }); },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['users']['Update'] }) => {
      return api.update('users', id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_students'] }); },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.softDelete('users', id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_students'] }); },
  });
}