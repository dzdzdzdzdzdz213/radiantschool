import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

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

interface InvoiceRow {
  id: number;
  student_id: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  paid_amount: number | null;
  status: Database['public']['Enums']['invoice_status'] | null;
  due_date: string | null;
  student: { user: { first_name: string | null; last_name: string | null } | null } | null;
}

export interface InvoiceInput {
  student_id?: string;
  amount?: number;
  total_amount?: number;
  paid_amount?: number;
  due_date: string;
  description?: string;
  notes?: string;
  status?: string;
}

export function useInvoices(search: string = '', page: number = 1, statusFilter: string = '') {
  return useQuery({
    queryKey: ['assistant_invoices', search, page, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('id, student_id, invoice_number, total_amount, paid_amount, status, due_date, student:students!student_id(user:users!students_id_fkey(first_name, last_name))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .is('deleted_at', null)
        .range((page - 1) * 20, page * 20 - 1);
      if (statusFilter) query = query.eq('status', statusFilter as never);
      if (search) {
        const like = `%${search}%`;
        const { data: matchingUsers } = await supabase
          .from('users')
          .select('id')
          .or(`first_name.ilike.${like},last_name.ilike.${like}`);
        const ids = (matchingUsers ?? []).map((u) => u.id);
        query = query.in('student_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
      }
      const { data, count } = await query;
      const rows = (data ?? []) as unknown as InvoiceRow[];
      const items = rows.map((r) => ({
        id: String(r.id),
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
    mutationFn: async (data: InvoiceInput) => {
      const { data: result, error } = await supabase.from('invoices').insert(data as unknown as Database['public']['Tables']['invoices']['Insert']).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceInput> }) => {
      const { error } = await supabase.from('invoices').update(data as unknown as Database['public']['Tables']['invoices']['Update']).eq('id', Number(id));
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').update({ deleted_at: new Date().toISOString() }).eq('id', Number(id));
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_invoices'] }); },
  });
}

export interface RecordPaymentInput {
  invoice_id: number;
  amount: number;
  payment_method: Database['public']['Enums']['payment_method'];
  payment_date: string;
  notes?: string;
}

export interface RecordPaymentResult {
  payment_id?: number;
  receipt_number?: string;
  invoice_status?: string;
  remaining?: number;
}

export function useRecordInvoicePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecordPaymentInput): Promise<RecordPaymentResult> => {
      const { data: result, error } = await supabase.rpc('record_invoice_payment', {
        p_invoice_id: data.invoice_id,
        p_amount: data.amount,
        p_payment_method: data.payment_method,
        p_payment_date: data.payment_date,
        p_notes: data.notes ?? undefined,
      });
      if (error) throw error;
      return (result ?? {}) as RecordPaymentResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_invoices'] });
      qc.invalidateQueries({ queryKey: ['assistant_report_payments'] });
    },
  });
}