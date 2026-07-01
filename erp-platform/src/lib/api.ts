import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParams[];
  search?: string;
  searchColumns?: string[];
}

// ─── API Error ──────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  code: string | undefined;
  details: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static fromPostgrest(error: { message: string; code?: string; details?: unknown; status?: number }): ApiError {
    return new ApiError(error.message, error.status ?? 500, error.code, error.details);
  }

  static notFound(entity: string): ApiError {
    return new ApiError(`${entity} not found`, 404, 'NOT_FOUND');
  }

  static validation(message: string): ApiError {
    return new ApiError(message, 400, 'VALIDATION_ERROR');
  }

  static unauthorized(): ApiError {
    return new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409, 'CONFLICT');
  }

  get isNotFound(): boolean { return this.statusCode === 404; }
  get isValidation(): boolean { return this.statusCode === 400; }
  get isUnauthorized(): boolean { return this.statusCode === 401; }
  get isConflict(): boolean { return this.statusCode === 409; }
}

// ─── Core API Functions ─────────────────────────────────────

function tb(table: string) {
  return supabase.from(table as any);
}

export const api = {
  // ─── List with pagination, filtering, sorting, search ──

  async list<T extends Record<string, any>>(
    table: string,
    params: QueryParams = {},
    select: string = '*',
  ): Promise<PaginatedResult<T>> {
    const { pagination, filters, sort, search, searchColumns } = params;

    let countQuery = tb(table).select('*', { count: 'exact', head: true });
    if (filters) {
      for (const f of filters) {
        if (f.operator === 'eq') countQuery = countQuery.eq(f.column, f.value);
        else if (f.operator === 'neq') countQuery = countQuery.neq(f.column, f.value);
        else if (f.operator === 'gt') countQuery = countQuery.gt(f.column, f.value);
        else if (f.operator === 'gte') countQuery = countQuery.gte(f.column, f.value);
        else if (f.operator === 'lt') countQuery = countQuery.lt(f.column, f.value);
        else if (f.operator === 'lte') countQuery = countQuery.lte(f.column, f.value);
        else if (f.operator === 'like') countQuery = countQuery.like(f.column, `%${f.value}%`);
        else if (f.operator === 'ilike') countQuery = countQuery.ilike(f.column, `%${f.value}%`);
        else if (f.operator === 'in') countQuery = countQuery.in(f.column, f.value as any[]);
        else if (f.operator === 'is') countQuery = countQuery.is(f.column, f.value);
      }
    }
    if (search && searchColumns?.length) {
      const conditions = searchColumns.map(col => `${col}.ilike.%${search}%`);
      countQuery = countQuery.or(conditions.join(','));
    }
    const { count: total, error: countError } = await countQuery;
    if (countError) throw ApiError.fromPostgrest(countError);

    let query = tb(table).select(select);
    if (filters) {
      for (const f of filters) {
        if (f.operator === 'eq') query = query.eq(f.column, f.value);
        else if (f.operator === 'neq') query = query.neq(f.column, f.value);
        else if (f.operator === 'gt') query = query.gt(f.column, f.value);
        else if (f.operator === 'gte') query = query.gte(f.column, f.value);
        else if (f.operator === 'lt') query = query.lt(f.column, f.value);
        else if (f.operator === 'lte') query = query.lte(f.column, f.value);
        else if (f.operator === 'like') query = query.like(f.column, `%${f.value}%`);
        else if (f.operator === 'ilike') query = query.ilike(f.column, `%${f.value}%`);
        else if (f.operator === 'in') query = query.in(f.column, f.value as any[]);
        else if (f.operator === 'is') query = query.is(f.column, f.value);
      }
    }
    if (search && searchColumns?.length) {
      const conditions = searchColumns.map(col => `${col}.ilike.%${search}%`);
      query = query.or(conditions.join(','));
    }
    if (sort) {
      for (const s of sort) {
        query = query.order(s.column, { ascending: s.direction === 'asc' });
      }
    }
    if (pagination) {
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw ApiError.fromPostgrest(error);

    const totalPages = pagination ? Math.ceil((total ?? 0) / pagination.pageSize) : 1;
    return {
      data: (data ?? []) as T[],
      meta: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? (data ?? []).length,
        total: total ?? 0,
        totalPages,
      },
    };
  },

  // ─── Get by ID ─────────────────────────────────────────

  async get<T>(table: string, id: string | number, select: string = '*'): Promise<T> {
    const { data, error } = await tb(table).select(select).eq('id', id).single();
    if (error) throw ApiError.fromPostgrest(error);
    return data as T;
  },

  // ─── Create ────────────────────────────────────────────

  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await tb(table).insert(data as any).select().single();
    if (error) throw ApiError.fromPostgrest(error);
    return result as T;
  },

  // ─── Update ────────────────────────────────────────────

  async update<T>(table: string, id: string | number, data: Partial<T>): Promise<T> {
    const { data: result, error } = await tb(table).update(data as any).eq('id', id).select().single();
    if (error) throw ApiError.fromPostgrest(error);
    return result as T;
  },

  // ─── Delete (soft) ─────────────────────────────────────

  async softDelete(table: string, id: string | number): Promise<void> {
    const { error } = await tb(table)
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) throw ApiError.fromPostgrest(error);
  },

  // ─── Hard Delete ───────────────────────────────────────

  async hardDelete(table: string, id: string | number): Promise<void> {
    const { error } = await tb(table).delete().eq('id', id);
    if (error) throw ApiError.fromPostgrest(error);
  },

  // ─── Batch operations ──────────────────────────────────

  async createMany<T>(table: string, data: Partial<T>[]): Promise<T[]> {
    const { data: result, error } = await tb(table).insert(data as any[]).select();
    if (error) throw ApiError.fromPostgrest(error);
    return (result ?? []) as T[];
  },

  async updateMany<T>(table: string, ids: (string | number)[], data: Partial<T>): Promise<T[]> {
    const { data: result, error } = await tb(table).update(data as any).in('id', ids as any[]).select();
    if (error) throw ApiError.fromPostgrest(error);
    return (result ?? []) as T[];
  },

  // ─── RPC calls ──────────────────────────────────────────

  async rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
    const { data, error } = await (supabase.rpc as any)(fn, args);
    if (error) throw ApiError.fromPostgrest(error);
    return data as T;
  },

  // ─── Search ─────────────────────────────────────────────

  async search<T>(table: string, query: string, select: string = '*', limit: number = 20): Promise<T[]> {
    const { data, error } = await tb(table).select(select).textSearch('name', query, { type: 'websearch' }).limit(limit);
    if (error) throw ApiError.fromPostgrest(error);
    return (data ?? []) as T[];
  },
};

// ─── Rate Limiter ────────────────────────────────────────────

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number = 60, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

// ─── Cache utilities ─────────────────────────────────────────

const cacheStore = new Map<string, { data: unknown; expiresAt: number }>();

export function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 60_000): void {
  cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
}
