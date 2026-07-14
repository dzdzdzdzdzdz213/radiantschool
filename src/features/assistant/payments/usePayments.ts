import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PaymentRecord {
  id: string;
  student_id: string | null;
  studentName: string;
  amount: number;
  method: string;
  type: string;
  receiptNumber: string | null;
  paymentDate: string;
  courseName: string | null;
}

export function usePayments(search: string = '', page: number = 1) {
  return useQuery({
    queryKey: ['assistant_payments', search, page],
    queryFn: async () => {
      let query = (supabase as any)
        .from('payments')
        .select('id, student_id, amount, payment_method, payment_type, receipt_number, payment_date, student:students!student_id(user:users!students_id_fkey(first_name, last_name)), course:courses(name)', { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      if (search) {
        const like = `%${search}%`;
        const { data: matchingUsers } = await (supabase as any)
          .from('users')
          .select('id')
          .or(`first_name.ilike.${like},last_name.ilike.${like}`);
        const ids = (matchingUsers ?? []).map((u: any) => u.id);
        query = query.in('student_id', ids.length ? ids : [null]);
      }
      const { data, count } = await query;
      const items = (data ?? []).map((r: any) => ({
        id: r.id,
        student_id: r.student_id ?? null,
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        amount: r.amount ?? 0,
        method: r.payment_method ?? '',
        type: r.payment_type ?? '',
        receiptNumber: r.receipt_number ?? null,
        paymentDate: r.payment_date ?? '',
        courseName: r.course?.name ?? null,
      })) as PaymentRecord[];
      return { data: items, meta: { page, pageSize: 20, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / 20) } };
    },
    staleTime: 10_000,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return supabase.functions.invoke('process-payment', { body: data });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_payments'] }); },
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await (supabase as any).from('payments').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_payments'] }); },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('payments').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_payments'] }); },
  });
}