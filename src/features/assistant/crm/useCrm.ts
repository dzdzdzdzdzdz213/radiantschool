import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type CrmStage = Database['public']['Tables']['crm_stages']['Row'];
type CrmLead = Database['public']['Tables']['crm_leads']['Row'];
type CrmActivity = Database['public']['Tables']['crm_activities']['Row'];

export interface PipelineDeal {
  id: number;
  title: string;
  child_name: string | null;
  amount: number;
  stage_id: number;
  expected_close_date: string | null;
  stage_changed_at: string;
  last_activity_at: string | null;
  owner: { first_name: string | null; last_name: string | null } | null;
  lead: { first_name: string; last_name: string | null; phone: string | null; whatsapp: string | null } | null;
}

const ACTIVITIES_TAIL = 12;

function stageIsClosed(stage: { is_won: boolean; is_lost: boolean } | null | undefined) {
  return !!stage?.is_won || !!stage?.is_lost;
}

export function useCrmStages() {
  return useQuery({
    queryKey: ['crm_stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_stages').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      return data as CrmStage[];
    },
    staleTime: 60_000,
  });
}

export function useCrmPipeline() {
  return useQuery({
    queryKey: ['crm_pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('id, title, child_name, amount, stage_id, expected_close_date, stage_changed_at, last_activity_at, owner:users!crm_deals_owner_id_fkey(first_name, last_name), lead:crm_leads!crm_deals_lead_id_fkey(first_name, last_name, phone, whatsapp)')
        .is('deleted_at', null)
        .order('stage_changed_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PipelineDeal[];
    },
    staleTime: 15_000,
  });
}

export function useCrmLeads(search: string = '') {
  return useQuery({
    queryKey: ['crm_leads', search],
    queryFn: async () => {
      let query = supabase
        .from('crm_leads')
        .select('*, deals:crm_deals(id, amount, stage:crm_stages(name, is_won, is_lost), deleted_at)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

export function useCrmLead(id: number | null) {
  return useQuery({
    queryKey: ['crm_lead', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_leads').select('*').eq('id', id as number).single();
      if (error) throw error;
      return data as CrmLead;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useLeadDeals(leadId: number | null) {
  return useQuery({
    queryKey: ['crm_lead_deals', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('id, title, child_name, amount, stage_id, expected_close_date, stage_changed_at, closed_at, closed_reason, course:courses!crm_deals_course_id_fkey(name), level:levels!crm_deals_level_id_fkey(name), stage:crm_stages(name, color, is_won, is_lost)')
        .eq('lead_id', leadId as number)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!leadId,
    staleTime: 15_000,
  });
}

export function useLeadActivities(leadId: number | null) {
  return useQuery({
    queryKey: ['crm_lead_activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('lead_id', leadId as number)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(ACTIVITIES_TAIL);
      if (error) throw error;
      return (data ?? []) as CrmActivity[];
    },
    enabled: !!leadId,
    staleTime: 15_000,
  });
}

export function useFollowupsDue() {
  return useQuery({
    queryKey: ['crm_followups_due'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_followups_due')
        .select('*')
        .order('due_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['crm_leads']['Insert']) => {
      const { data, error } = await supabase.from('crm_leads').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm_leads'] }),
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['crm_deals']['Insert']) => {
      const { data, error } = await supabase.from('crm_deals').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_pipeline'] });
      qc.invalidateQueries({ queryKey: ['crm_leads'] });
      qc.invalidateQueries({ queryKey: ['crm_lead_deals'] });
    },
  });
}

export function useMoveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, reason }: { id: number; stage: CrmStage; reason?: string }) => {
      const now = new Date().toISOString();
      const patch: Database['public']['Tables']['crm_deals']['Update'] = {
        stage_id: stage.id,
        stage_changed_at: now,
        closed_at: stageIsClosed(stage) ? now : null,
        closed_reason: stage.is_lost ? (reason || 'perdu') : null,
      };
      const { error } = await supabase.from('crm_deals').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_pipeline'] });
      qc.invalidateQueries({ queryKey: ['crm_lead_deals'] });
      qc.invalidateQueries({ queryKey: ['crm_leads'] });
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database['public']['Tables']['crm_activities']['Insert']) => {
      const { data, error } = await supabase.from('crm_activities').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_lead_activities'] });
      qc.invalidateQueries({ queryKey: ['crm_followups_due'] });
    },
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('crm_activities')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_followups_due'] });
      qc.invalidateQueries({ queryKey: ['crm_lead_activities'] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Database['public']['Tables']['crm_leads']['Update']> }) => {
      const { error } = await supabase.from('crm_leads').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_lead'] });
      qc.invalidateQueries({ queryKey: ['crm_leads'] });
    },
  });
}

export function useTouchLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dealId }: { id: number; dealId?: number | null }) => {
      const now = new Date().toISOString();
      const builders = [
        supabase.from('crm_leads').update({ last_activity_at: now }).eq('id', id),
        ...(dealId ? [supabase.from('crm_deals').update({ last_activity_at: now }).eq('id', dealId)] : []),
      ];
      const results = await Promise.all(builders.map(b => b.then(r => r)));
      const err = results.find(r => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm_pipeline'] });
      qc.invalidateQueries({ queryKey: ['crm_lead'] });
      qc.invalidateQueries({ queryKey: ['crm_lead_deals'] });
      qc.invalidateQueries({ queryKey: ['crm_leads'] });
    },
  });
}
