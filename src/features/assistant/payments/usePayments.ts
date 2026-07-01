import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export interface PaymentRecord {
  id: string;
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
      const { data, count } = await (supabase as any)
        .from('payments')
        .select('id, amount, payment_method, payment_type, receipt_number, payment_date, student:users!student_id(first_name, last_name), course:courses(name)', { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      const items = (data ?? []).map((r: any) => ({
        id: r.id,
        studentName: r.student ? `${r.student.first_name ?? ''} ${r.student.last_name ?? ''}` : 'Inconnu',
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
      return api.rpc('process_payment', data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_payments'] }); },
  });
}