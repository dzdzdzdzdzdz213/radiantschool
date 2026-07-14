import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface InvoiceRecord {
  id: string;
  student_id: string | null;
  invoiceNumber: string;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
}

export function useInvoices(search: string = '', page: number = 1, statusFilter: string = '') {
  return useQuery({
    queryKey: ['assistant_invoices', search, page, statusFilter],
    queryFn: async () => {
      let query = (supabase as any)
        .from('invoices')
        .select('id, student_id, invoice_number, total_amount, paid_amount, status, due_date, student:students!student_id(user:users!students_id_fkey(first_name, last_name))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      if (statusFilter) query = query.eq('status', statusFilter);
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
        invoiceNumber: r.invoice_number ?? '',
        studentName: r.student ? `${r.student.user?.first_name ?? ''} ${r.student.user?.last_name ?? ''}` : 'Inconnu',
        totalAmount: r.total_amount ?? 0,
        paidAmount: r.paid_amount ?? 0,
        status: r.status ?? '',
        dueDate: r.due_date ?? '',
      })) as InvoiceRecord[];
      return { data: items, meta: { page, pageSize: 20, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / 20) } };
    },
    staleTime: 10_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase as any).from('invoices').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await (supabase as any).from('invoices').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('invoices').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}