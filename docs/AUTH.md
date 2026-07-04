# Authentication & Authorization

## Auth Provider

`src/hooks/useAuth.tsx` provides `AuthProvider` and the `useAuth()` hook.

```
AuthProvider wraps the app inside RouterProvider.
On mount: reads session via supabase.auth.getSession()
  -> listens for onAuthStateChange
  -> on session change, fetches profile from users table
     and stores { user, profile, isLoading } in context
```

### Hook API

```typescript
const { user, profile, isLoading, signIn, signUp, signOut, refreshProfile } = useAuth();
```

| Member | Description |
|---|---|
| `user` | Supabase `User` object, or `null` |
| `profile` | `UserProfile` from `users` table, or `null` |
| `isLoading` | `true` while initial session check / profile fetch is in progress |
| `signIn(email, password)` | Authenticates via `supabase.auth.signInWithPassword` |
| `signUp(...)` | Creates auth user + inserts into `users` + creates role-specific record (see below) |
| `signOut()` | Calls `supabase.auth.signOut()`, clears local state |
| `refreshProfile()` | Re-fetches the profile row |

### Sign-Up Flow

1. `supabase.auth.signUp()` creates the auth identity.
2. Row inserted into `users` table with role, names, email.
3. Role-specific record created:
   - **student** → `students` table
   - **teacher** → `teachers` table
   - **assistant** → `assistants` table
   - **parent** → `parents` table + `students` (child) + `student_parent` link

## Protected Routes

`src/components/auth/ProtectedRoute.tsx` — renders children only when:

- User is authenticated (`user` is not null).
- Profile status is `active` (shows custom message for `pending` / `suspended` / `inactive`).
- User's role is in `allowedRoles` (otherwise redirects to the user's own role dashboard).

```
<ProtectedRoute allowedRoles={['admin']}>
  <AdminLayout>
    <Outlet />
  </AdminLayout>
</ProtectedRoute>
```

### Role Route Wrappers

| File | Path prefix | Allowed role | Layout |
|---|---|---|---|
| `src/routes/AdminRoute.tsx` | `/admin/*` | `admin` | `AdminLayout` |
| `src/routes/AssistantRoute.tsx` | `/assistant/*` | `assistant` | `AssistantLayout` |
| `src/routes/TeacherRoute.tsx` | `/teacher/*` | `teacher` | `TeacherLayout` |
| `src/routes/StudentRoute.tsx` | `/student/*` | `student` | `StudentLayout` |
| `src/routes/ParentRoute.tsx` | `/parent/*` | `parent` | `ParentLayout` |

## Routing Structure

- **Public routes**: `/login/:role?`, `/register`, `/forgot-password`, `/reset-password`, `/leaderboard`, `/` (landing page).
- **Role-specific** routes are nested under role prefixes (`/admin/*`, `/teacher/*`, etc.).
- Each role section has index → `SafeRedirect` to `dashboard` sub-route.
- Unknown paths fall through to a redirect to `/login`.

## Supabase Client

`src/lib/supabase.ts` creates a typed client:

```typescript
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } },
});
```
