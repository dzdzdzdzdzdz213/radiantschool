import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

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

  return useMutation<T, Error, Partial<T>, { previousData: unknown; tempId: string }>({
    mutationFn: async (data) => {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert(data)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return result as T;
    },

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newData, id: tempId } as unknown as T;

      queryClient.setQueryData(queryKey, (old: any) =>
        Array.isArray(old) ? [optimisticItem, ...old] : old,
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
        queryClient.setQueryData(queryKey, (old: any) =>
          Array.isArray(old)
            ? old.map((item: any) =>
                item.id === context.tempId ? _data : item,
              )
            : old,
        );
      }
      if (successMessage) toast(successMessage, 'success');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

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

  return useMutation<void, Error, T, { previousData: unknown }>({
    mutationFn: async (item) => {
      const { field, newValue } = getToggleField(item);
      const { error } = await (supabase as any)
        .from(table)
        .update({ [field]: newValue })
        .eq('id', item.id);
      if (error) throw new Error(error.message);
    },

    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const { field, newValue } = getToggleField(item);
      queryClient.setQueryData(queryKey, (old: any) =>
        Array.isArray(old)
          ? old.map((i: any) =>
              i.id === item.id ? { ...i, [field]: newValue } : i,
            )
          : old,
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

  return useMutation<void, Error, string | number, { previousData: unknown }>({
    mutationFn: async (id) => {
      const { error } = await (supabase as any)
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) =>
        Array.isArray(old)
          ? old.filter((item: any) => item.id !== id)
          : old,
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
