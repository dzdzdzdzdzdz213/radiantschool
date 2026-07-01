import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api, ApiError, type QueryParams, type PaginatedResult, type PaginationParams, type SortParams, type FilterParams } from '@/lib/api';

// ─── usePaginatedQuery ──────────────────────────────────────
// Generic hook for listing entities with full pagination/filtering/sorting/search

interface UsePaginatedQueryOptions<T> {
  queryKey: QueryKey;
  table: string;
  select?: string;
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParams[];
  search?: string;
  searchColumns?: string[];
  enabled?: boolean;
  staleTime?: number;
}

export function usePaginatedQuery<T extends Record<string, any>>({
  queryKey,
  table,
  select = '*',
  pagination = { page: 1, pageSize: 20 },
  sort,
  filters,
  search,
  searchColumns,
  enabled = true,
  staleTime = 30_000,
}: UsePaginatedQueryOptions<T>) {
  const queryParams: QueryParams = { pagination, sort, filters, search, searchColumns };

  return useQuery<PaginatedResult<T>, ApiError>({
    queryKey: [...queryKey, pagination, sort, filters, search],
    queryFn: () => api.list<T>(table, queryParams, select),
    enabled,
    staleTime,
    placeholderData: (prev) => prev,
  });
}

// ─── useGetById ──────────────────────────────────────────────
// Generic hook for fetching a single entity by ID

export function useGetById<T>(
  queryKey: QueryKey,
  table: string,
  id: string | number | undefined | null,
  select: string = '*',
) {
  return useQuery<T, ApiError>({
    queryKey: [...queryKey, id],
    queryFn: () => api.get<T>(table, id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ─── Generic CRUD Mutations ─────────────────────────────────

export function useCreate<T>(queryKey: QueryKey, table: string) {
  const queryClient = useQueryClient();
  return useMutation<T, ApiError, Partial<T>>({
    mutationFn: (data) => api.create<T>(table, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });
}

export function useUpdate<T>(queryKey: QueryKey, table: string) {
  const queryClient = useQueryClient();
  return useMutation<T, ApiError, { id: string | number; data: Partial<T> }>({
    mutationFn: ({ id, data }) => api.update<T>(table, id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });
}

export function useRemove(queryKey: QueryKey, table: string, soft: boolean = true) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string | number>({
    mutationFn: (id) => soft ? api.softDelete(table, id) : api.hardDelete(table, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });
}

// ─── Optimistic Update Mutation ─────────────────────────────

interface OptimisticUpdateConfig<T> {
  queryKey: QueryKey;
  table: string;
  optimisticUpdate: (oldData: PaginatedResult<T> | undefined, variables: { id: string | number; data: Partial<T> }) => PaginatedResult<T> | undefined;
}

export function useOptimisticUpdate<T extends { id: string | number }>({
  queryKey,
  table,
  optimisticUpdate,
}: OptimisticUpdateConfig<T>) {
  const queryClient = useQueryClient();

  return useMutation<T, ApiError, { id: string | number; data: Partial<T> }, { previousData: unknown }>({
    mutationFn: ({ id, data }) => api.update<T>(table, id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResult<T>>(queryKey);
      queryClient.setQueryData<PaginatedResult<T>>(queryKey, (old) =>
        optimisticUpdate(old, { id, data }),
      );
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// ─── useRPC ──────────────────────────────────────────────────

export function useRPC<T>(name: string, args?: Record<string, unknown>, enabled: boolean = true) {
  return useQuery<T, ApiError>({
    queryKey: ['rpc', name, args],
    queryFn: () => api.rpc<T>(name, args),
    enabled,
    staleTime: 30_000,
  });
}

// ─── useSearch ───────────────────────────────────────────────

export function useSearch<T>(
  table: string,
  searchQuery: string,
  select: string = 'id, first_name, last_name, email, phone, photo_url',
) {
  return useQuery<T[], ApiError>({
    queryKey: ['search', table, searchQuery],
    queryFn: () => api.search<T>(table, searchQuery, select),
    enabled: searchQuery.length >= 2,
    staleTime: 10_000,
  });
}
