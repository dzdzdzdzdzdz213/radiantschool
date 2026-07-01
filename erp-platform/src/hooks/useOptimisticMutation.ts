import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

// ─── Optimistic Insert ───────────────────────────────────────

interface UseOptimisticInsertOptions<T> {
  queryKey: QueryKey;
  table: string;
  successMessage?: string;
}

export function useOptimisticInsert<T extends Record<string, any>>({
  queryKey,
  table,
  successMessage,
}: UseOptimisticInsertOptions<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<T, ApiError, Partial<T>>({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      if (error) throw ApiError.fromPostgrest(error);
      return result as T;
    },

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T[]>(queryKey);

      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newData, id: tempId } as T;

      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old ? [optimisticItem, ...old] : [optimisticItem],
      );

      return { previousData, tempId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast(_err.message, 'error');
    },

    onSuccess: (_data, _vars, context) => {
      if (context?.tempId) {
        queryClient.setQueryData<T[]>(queryKey, (old) =>
          old?.map(item =>
            (item as any).id === context.tempId ? _data : item,
          ) ?? [],
        );
      }
      if (successMessage) toast(successMessage, 'success');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// ─── Optimistic Update (toggle status, etc.) ─────────────────

interface UseOptimisticToggleOptions<T> {
  queryKey: QueryKey;
  table: string;
  getToggleField: (item: T) => { field: keyof T; newValue: any };
  successMessage?: string;
}

export function useOptimisticToggle<T extends { id: string | number }>({
  queryKey,
  table,
  getToggleField,
  successMessage,
}: UseOptimisticToggleOptions<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, ApiError, T>({
    mutationFn: async (item) => {
      const { field, newValue } = getToggleField(item);
      const { error } = await supabase
        .from(table)
        .update({ [field]: newValue } as any)
        .eq('id', item.id);
      if (error) throw ApiError.fromPostgrest(error);
    },

    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const { field, newValue } = getToggleField(item);
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old?.map(i =>
          i.id === item.id ? { ...i, [field]: newValue } : i,
        ) ?? [],
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast(_err.message, 'error');
    },

    onSuccess: () => {
      if (successMessage) toast(successMessage, 'success');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// ─── Optimistic Delete ───────────────────────────────────────

interface UseOptimisticRemoveOptions {
  queryKey: QueryKey;
  table: string;
  successMessage?: string;
}

export function useOptimisticRemove({
  queryKey,
  table,
  successMessage,
}: UseOptimisticRemoveOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, ApiError, string | number>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw ApiError.fromPostgrest(error);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<any[]>(queryKey, (old) =>
        old?.filter(item => item.id !== id) ?? [],
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast(_err.message, 'error');
    },

    onSuccess: () => {
      if (successMessage) toast(successMessage, 'success');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
