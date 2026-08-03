# Permission Model

Defined in `src/lib/permissions.ts`.

## Role-Permission Map

```
admin:      ['*']
assistant:  users:read, courses:read/create/update/delete,
            payments:read, attendance:read/create,
            reports:read/export
teacher:    courses:read, attendance:read, users:read
student:    courses:read, attendance:read, payments:read
parent:     users:read, attendance:read, payments:read
```

## Permission Constants

Resource-action pairs are defined as a const object:

```typescript
const PERMISSIONS = {
  users: { read: 'users:read' as const },
  courses: { read: 'courses:read' as const, create: 'courses:create' as const, ... },
  payments: { read: 'payments:read' as const },
  attendance: { read: 'attendance:read' as const, create: 'attendance:create' as const },
  reports: { read: 'reports:read' as const, export: 'reports:export' as const },
} as const;
```

## Utility Functions

```typescript
hasPermission(user, permission: string): boolean
canAccessRoute(user, route: string): boolean
getDefaultRoute(role): string
```

## RLS Policies

Row-Level Security is enforced server-side on all 30+ tables via a Supabase migration (`supabase/migrations/20240704_rls_policies.sql`). Policies use helper functions:

- `is_admin()` — checks `users.role = 'admin'`
- `is_teacher()` — checks `users.role = 'teacher'`
- `is_assistant()` — checks `users.role = 'assistant'`
- `is_student()` — checks `users.role = 'student'`
- `is_parent()` — checks `users.role = 'parent'`

### Policy Patterns

| Data scope                               | Pattern                                     |
| ---------------------------------------- | ------------------------------------------- |
| **Global** (users, levels, subjects)     | Admins full access; others filtered by role |
| **Own** (own profile, own notifications) | `user_id = auth.uid()`                      |
| **Related** (children data for parents)  | Via `student_parent` join                   |
| **Teaching** (courses, schedules)        | `teacher_id = auth.uid()`                   |
| **Enrolled** (course data for students)  | Via `course_enrollments` join               |

Client-side permissions complement RLS for UI rendering (show/hide buttons, sections). RLS is the definitive enforcement layer.
