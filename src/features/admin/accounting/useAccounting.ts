import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Account = Database['public']['Tables']['accounts']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

export interface JournalLineInput {
  account_id: number;
  debit: number;
  credit: number;
  description?: string | null;
}

export interface PostJournalInput {
  posting_date: string;
  title: string;
  voucher_type: Database['public']['Enums']['acct_voucher_type'];
  remarks?: string | null;
  reference_type?: string | null;
  reference_id?: number | null;
  lines: JournalLineInput[];
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounts').select('*').eq('disabled', false).order('account_number', { ascending: true });
      if (error) throw error;
      return data as Account[];
    },
    staleTime: 120_000,
  });
}

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('posting_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as JournalEntry[];
    },
    staleTime: 10_000,
  });
}

export function useLedger(accountId: number | null) {
  return useQuery({
    queryKey: ['ledger', accountId],
    queryFn: async () => {
      let query = supabase.from('v_ledger').select('*').order('posting_date', { ascending: false }).limit(300);
      if (accountId) query = query.eq('account_id', accountId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });
}

export function useTrialBalance() {
  return useQuery({
    queryKey: ['trial_balance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_trial_balance').select('*');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });
}

export function useIncomeStatement() {
  return useQuery({
    queryKey: ['income_statement'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_income_statement').select('*');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });
}

export function useReceivablesAging() {
  return useQuery({
    queryKey: ['receivables_aging'],
    queryFn: async () => {
      const { data, error } = await supabase.from('v_receivables_aging').select('*').limit(200);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });
}

export function usePostJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PostJournalInput) => {
      const { data, error } = await supabase.rpc('post_journal_entry', {
        p_posting_date: input.posting_date,
        p_title: input.title,
        p_voucher_type: input.voucher_type,
        p_remarks: input.remarks ?? undefined,
        p_reference_type: input.reference_type ?? undefined,
        p_reference_id: input.reference_id ?? undefined,
        p_lines: input.lines as unknown as never,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal_entries'] });
      qc.invalidateQueries({ queryKey: ['ledger'] });
      qc.invalidateQueries({ queryKey: ['trial_balance'] });
      qc.invalidateQueries({ queryKey: ['income_statement'] });
      qc.invalidateQueries({ queryKey: ['receivables_aging'] });
    },
  });
}

export function useCancelJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (journalId: number) => {
      const { error } = await supabase.rpc('cancel_journal_entry', { p_journal_id: journalId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal_entries'] });
      qc.invalidateQueries({ queryKey: ['ledger'] });
      qc.invalidateQueries({ queryKey: ['trial_balance'] });
      qc.invalidateQueries({ queryKey: ['income_statement'] });
      qc.invalidateQueries({ queryKey: ['receivables_aging'] });
    },
  });
}
