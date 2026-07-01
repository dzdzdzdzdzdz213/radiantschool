import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

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

export function useAttendance(date?: string, search: string = '') {
  const today = date ?? new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['assistant_attendance', today, search],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('attendance')
        .select('id, date, status, method, created_at, student:users!student_id(first_name, last_name, id), course_schedule:course_schedules!inner(course:courses(name))')
        .eq('date', today)
        .order('created_at', { ascending: false });
      let items = (data ?? []).map((r: any) => ({
        id: r.id,
        studentId: r.student?.id ?? '',
        studentName: r.student ? `${r.student.first_name ?? ''} ${r.student.last_name ?? ''}` : 'Inconnu',
        courseName: r.course_schedule?.course?.name ?? '',
        date: r.date,
        status: r.status,
        method: r.method ?? 'manual',
        checkIn: r.created_at,
      })) as AttendanceRecord[];
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_attendance'] }); },
  });
}

export function useCorrectAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.update('attendance', id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_attendance'] }); },
  });
}