import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api, type QueryParams } from '@/lib/api';

export interface ParentListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
}

export function useParents(search: string = '', page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['assistant_parents', search, page, pageSize],
    queryFn: async () => {
      const params: QueryParams = {
        pagination: { page, pageSize },
        sort: [{ column: 'created_at', direction: 'desc' as const }],
        filters: [{ column: 'role', operator: 'eq' as const, value: 'parent' }, { column: 'deleted_at', operator: 'is' as const, value: null }],
      };
      if (search) { params.search = search; params.searchColumns = ['first_name', 'last_name', 'email']; }
      const result = await api.list('users', params, 'id, first_name, last_name, email, phone, status, created_at');
      const data = result.data.map((r) => ({
        id: r.id,
        firstName: r.first_name ?? '',
        lastName: r.last_name ?? '',
        email: r.email ?? '',
        phone: r.phone ?? null,
        status: r.status ?? '',
      })) as ParentListItem[];
      return { data, meta: result.meta };
    },
    staleTime: 10_000,
  });
}

export interface ParentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  status?: string;
  role: string;
  password?: string;
}

export function useCreateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ first_name, last_name, email, phone, status = 'pending', role, password }: ParentInput) => {
      const { data: { session: prevSession } } = await supabase.auth.getSession();
      const effectivePassword = password ?? crypto.randomUUID().replace(/-/g, '').slice(0, 16) + '!Aa1';
      const { data: signUpRes, error: signUpError } = await supabase.auth.signUp({
        email,
        password: effectivePassword,
        options: { data: { first_name, last_name, role } },
      });
      if (signUpError) throw signUpError;
      if (!signUpRes?.user) throw new Error('Aucun utilisateur créé');
      if (prevSession) {
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
      const { error: inviteError } = await supabase.functions.invoke('send-invite', {
        body: { user_id: signUpRes.user.id },
      });
      if (inviteError) throw new Error(inviteError.message || 'Erreur lors de l\'envoi de l\'invitation');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_parents'] }); },
  });
}

export function useUpdateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ParentInput }) => {
      return api.update('users', id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_parents'] }); },
  });
}

export function useDeleteParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.softDelete('users', id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_parents'] }); },
  });
}