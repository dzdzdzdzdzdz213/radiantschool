import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  date: string;
  status: string;
  method: string;
  checkIn: string | null;
}

function localToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

export function useAttendance(date?: string, search: string = '') {
  const today = date ?? localToday();
  return useQuery({
    queryKey: ['attendance', 'assistant', today, search],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select('id, date, status, method, created_at, student:students!student_id(user:users!students_id_fkey(first_name, last_name, id)), course_schedule:course_schedules!inner(course:courses(name))')
        .eq('date', today);
      const { data } = await query
        .order('created_at', { ascending: false });
      let items = (data ?? []).map((r) => ({
        id: String(r.id),
        studentId: r.student?.user?.id ?? '',
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        courseName: r.course_schedule?.course?.name ?? '',
        date: r.date,
        status: r.status,
        method: r.method ?? 'manual',
        checkIn: r.created_at,
      })) as unknown as AttendanceRecord[];
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(i => i.studentName.toLowerCase().includes(q));
      }
      return items;
    },
    staleTime: 10_000,
  });
}

export function useRecordAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { student_id: string; date: string; status: string; course_schedule_id?: string; method?: string }) => {
      return api.create('attendance', data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance', 'assistant'] }); },
  });
}

export function useCorrectAttendance() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { lang } = useLang();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Database['public']['Tables']['attendance']['Update']> }) => {
      return api.update('attendance', id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'assistant'] });
      toast(t('success.updated', lang, t('nav.attendance', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('errors.update_error', lang, t('nav.attendance', lang)), 'error'),
  });
}