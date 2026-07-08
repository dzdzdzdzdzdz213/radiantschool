# Data Layer

## Supabase Client (`src/lib/supabase.ts`)

Typed client using `createClient<Database>()`:

```
import { supabase } from '@/lib/supabase';
```

Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables. Realtime configured at 10 events/second.

## Generic API Layer (`src/lib/api.ts`)

A wrapper around Supabase queries providing consistent CRUD with pagination, filtering, sorting, and search.

### Query Parameters

```typescript
interface QueryParams {
  pagination?: { page: number; pageSize: number };
  sort?: { column: string; direction: 'asc' | 'desc' };
  filters?: Array<{ column: string; operator: FilterOperator; value: unknown }>;
  search?: string;
  searchColumns?: string[];
}
```

### API Methods

| Method | Description |
|---|---|
| `api.list(table, params, select?)` | Paginated list with filters, sort, full-text search |
| `api.get(table, id, select?)` | Single record by ID |
| `api.create(table, data)` | Insert and return new record |
| `api.update(table, id, data)` | Update by ID |
| `api.softDelete(table, id)` | Sets `deleted_at` |
| `api.hardDelete(table, id)` | Permanent delete |
| `api.createMany(table, data)` | Batch insert |
| `api.updateMany(table, ids, data)` | Batch update |
| `api.rpc(fn, args?)` | Call a Supabase RPC function |

### Type Safety

Two documented `as any` casts exist:
- **`tb()` helper**: dynamic table names cannot be statically typed against Supabase's typed overloads.
- **RPC wrapper**: generic RPC calls bypass typed overloads.

### Utilities

- `rateLimit(key, maxRequests, windowMs)` — in-memory rate limiter.
- `getCached<T>(key)` / `setCache<T>(key, data, ttlMs)` — in-memory cache.

## Zod Validation (`src/lib/validation.ts` + `src/lib/validate.ts`)

27 validation schemas covering all entities. All error messages use i18n keys prefixed with `validation.`.

```typescript
import { loginSchema, courseSchema } from '@/lib/validation';
import { validate } from '@/lib/validate';

const result = validate(loginSchema, { email, password }, lang);
if (!result.success) {
  // result.errors is an array of { field, message } with translated messages
}
```

### Key Schemas

| Export | Validates |
|---|---|
| `loginSchema` | Email + password (min 6) |
| `registerSchema` | Names, email, password, role (enum), phone (Algerian format) |
| `courseSchema` | Name, type, capacity, price, subject/level/teacher/room IDs, dates |
| `paymentSchema` | Student ID, amount, method, type |
| `attendanceSchema` / `attendanceBatchSchema` | Single and batch attendance |
| `studentSchema` | Names, email, level, student type, registration number |
| `scheduleSchema` | Course ID, day, time range, room, teacher |
| `assignmentSchema` | Course/teacher IDs, title, description, due date |
| `parentRegistrationSchema` | Parent + child + guardian info |
| `evaluationSchema` | Student/teacher/course IDs, score (0-20), comment |

### Validation Utility

```typescript
validate(schema, input, lang)
// -> { success: true, data } | { success: false, errors: FieldError[] }

formatZodErrors(error, lang)
// -> FieldError[] (translates validation.* message keys)
```

## Database Types (`src/types/database.ts`)

Comprehensive Supabase `Database` interface covering 30+ tables with Row/Insert/Update schemas. Includes views (`dashboard_kpi`, `v_daily_revenue`, etc.) and functions (`generate_monthly_invoices`).

```typescript
export type Database = {
  public: {
    Tables: { ... };
    Views: { ... };
    Functions: { ... };
  };
};
```

## Domain Models (`src/types/models.ts`)

Plain TypeScript interfaces for frontend use: `UserProfile`, `StudentProfile`, `TeacherProfile`, `Course`, `Payment`, `Invoice`, `Attendance`, `Evaluation`, `DashboardKPI`, etc.
