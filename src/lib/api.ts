import { supabase } from '@/lib/supabase';

/**
 * Zero-based page index and page size for cursor-free pagination.
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination metadata returned alongside every paginated response.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Sort specification with column name and direction.
 */
export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter specification with comparison operator.
 * - `in` expects an array value.
 * - `is` is for `IS NULL` / `IS NOT NULL` comparisons.
 */
export interface FilterParams {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
}

/**
 * Unified query parameters combining pagination, sorting, filtering, and search.
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParams[];
  search?: string;
  searchColumns?: string[];
}

// ─── API Error ──────────────────────────────────────────────

/**
 * Structured API error with HTTP status code, error code, and details.
 * Provides static factory methods and convenience type-check getters.
 */
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

// The tb helper accepts dynamic table names at runtime.
// The `from` overloads are typed per-table, so a generic string
// requires a cast. Remaining casts are for dynamic values passed
// to filter operators and RPC calls.
function tb(table: string) {
  return supabase.from(table as never);
}

/**
 * Generic CRUD API layer over Supabase with pagination, filtering, sorting,
 * full-text search, batch operations, and RPC support.
 * Every method throws {@link ApiError} on failure.
 */
export const api = {
  /**
   * Paginated list with optional filters, sorting, and full-text search.
   * Counts are fetched as an exact total for pagination metadata.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async list<T extends Record<string, any>>(
    table: string,
    params: QueryParams = {},
    select: string = '*',
  ): Promise<PaginatedResult<T>> {
    const { pagination, filters, sort, search, searchColumns } = params;

    let countQuery = tb(table).select('*', { count: 'exact', head: true });
    if (filters) {
      for (const f of filters) {
        const val = f.value as never;
        if (f.operator === 'eq') countQuery = countQuery.eq(f.column, val);
        else if (f.operator === 'neq') countQuery = countQuery.neq(f.column, val);
        else if (f.operator === 'gt') countQuery = countQuery.gt(f.column, val);
        else if (f.operator === 'gte') countQuery = countQuery.gte(f.column, val);
        else if (f.operator === 'lt') countQuery = countQuery.lt(f.column, val);
        else if (f.operator === 'lte') countQuery = countQuery.lte(f.column, val);
        else if (f.operator === 'like') countQuery = countQuery.like(f.column, `%${val}%`);
        else if (f.operator === 'ilike') countQuery = countQuery.ilike(f.column, `%${val}%`);
        else if (f.operator === 'in') countQuery = countQuery.in(f.column, val);
        else if (f.operator === 'is') countQuery = countQuery.is(f.column, val);
      }
    }
    if (search && searchColumns?.length) {
      const conditions = searchColumns.map(col => `${col}.ilike.%${search}%`);
      countQuery = countQuery.or(conditions.join(','));
    }
    const { count: total, error: countError } = await countQuery;
    if (countError) throw ApiError.fromPostgrest({ message: countError.message, code: countError.code, details: countError.details, status: 500 });

    let query = tb(table).select(select);
    if (filters) {
      for (const f of filters) {
        const val = f.value as never;
        if (f.operator === 'eq') query = query.eq(f.column, val);
        else if (f.operator === 'neq') query = query.neq(f.column, val);
        else if (f.operator === 'gt') query = query.gt(f.column, val);
        else if (f.operator === 'gte') query = query.gte(f.column, val);
        else if (f.operator === 'lt') query = query.lt(f.column, val);
        else if (f.operator === 'lte') query = query.lte(f.column, val);
        else if (f.operator === 'like') query = query.like(f.column, `%${val}%`);
        else if (f.operator === 'ilike') query = query.ilike(f.column, `%${val}%`);
        else if (f.operator === 'in') query = query.in(f.column, val);
        else if (f.operator === 'is') query = query.is(f.column, val);
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
      data: (data ?? []) as unknown as T[],
      meta: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? (data ?? []).length,
        total: total ?? 0,
        totalPages,
      },
    };
  },

  /** Fetches a single record by primary key. Throws if not found. */
  async get<T>(table: string, id: string | number, select: string = '*'): Promise<T> {
    const { data, error } = await tb(table).select(select).eq('id', id).single();
    if (error) throw ApiError.fromPostgrest(error);
    return data as T;
  },

  /** Inserts a record and returns the created row. */
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await tb(table).insert(data as never).select().single();
    if (error) throw ApiError.fromPostgrest(error);
    return result as T;
  },

  /** Updates a record by primary key and returns the updated row. */
  async update<T>(table: string, id: string | number, data: Partial<T>): Promise<T> {
    const { data: result, error } = await tb(table).update(data as never).eq('id', id).select().single();
    if (error) throw ApiError.fromPostgrest(error);
    return result as T;
  },

  /** Sets `deleted_at` on a record (soft delete). */
  async softDelete(table: string, id: string | number): Promise<void> {
    const { error } = await tb(table)
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);
    if (error) throw ApiError.fromPostgrest(error);
  },

  /** Permanently deletes a record. */
  async hardDelete(table: string, id: string | number): Promise<void> {
    const { error } = await tb(table).delete().eq('id', id);
    if (error) throw ApiError.fromPostgrest(error);
  },

  // ─── Batch operations ──────────────────────────────────

  async createMany<T>(table: string, data: Partial<T>[]): Promise<T[]> {
    const { data: result, error } = await tb(table).insert(data as never[]).select();
    if (error) throw ApiError.fromPostgrest(error);
    return (result ?? []) as unknown as T[];
  },

  async updateMany<T>(table: string, ids: (string | number)[], data: Partial<T>): Promise<T[]> {
    const { data: result, error } = await tb(table).update(data as never).in('id', ids as never[]).select();
    if (error) throw ApiError.fromPostgrest(error);
    return (result ?? []) as unknown as T[];
  },

  /**
   * Calls a Supabase RPC function. The generic parameter should match
   * the return type of the Postgres function.
   *
   * For known function names, use {@link apiRpc} instead for type safety.
   */
  async rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(fn as never, args as never);
    if (error) throw ApiError.fromPostgrest(error);
    return data as T;
  },

  /** Full-text search on the `name` column using websearch syntax. */
  async search<T>(table: string, query: string, select: string = '*', limit: number = 20): Promise<T[]> {
    const { data, error } = await tb(table).select(select).textSearch('name', query, { type: 'websearch' }).limit(limit);
    if (error) throw ApiError.fromPostgrest(error);
    return (data ?? []) as unknown as T[];
  },
};

// ─── Rate Limiter ────────────────────────────────────────────

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory rate limiter. Returns `true` if the request is allowed,
 * `false` if the key has exceeded the maximum within the time window.
 */
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

/**
 * Returns a cached value or `null` if the key does not exist or has expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Stores a value in the in-memory cache with a TTL in milliseconds.
 * Default TTL is 60 seconds.
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 60_000): void {
  cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
}
