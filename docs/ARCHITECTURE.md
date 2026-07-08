# Architecture

## Tech Stack

| Layer | Choice |
|---|---|
| **Runtime** | React 19, TypeScript 6.0 |
| **Bundler** | Vite 8 |
| **Routing** | react-router-dom v7 |
| **State / Server State** | TanStack React Query v5 |
| **Auth** | Supabase Auth (email/password) |
| **Database** | Supabase Postgres |
| **Validation** | Zod v4 |
| **UI** | Tailwind CSS v4, Radix UI primitives, Shadcn-style wrappers |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **i18n** | Custom (no framework — `t()` function + React context) |
| **Forms** | react-hook-form + `@hookform/resolvers` |
| **Linting** | Oxlint |

## Application Shell

```
QueryClientProvider (TanStack)
  -> ThemeProvider (light/dark)
    -> LangProvider (fr/en/ar)
      -> AuthProvider (Supabase session)
        -> ToastProvider
          -> Suspense
            -> RouterProvider
```

Default React Query settings: `staleTime: 120s`, `retry: 1`, `refetchOnWindowFocus: false`.

## Folder Layout

```
src/
├── assets/          Static images
├── components/      Shared UI components
│   ├── auth/        ProtectedRoute
│   ├── layout/      Topbar, Sidebar variants
│   └── ui/          Radix wrappers (button, card, table, etc.)
├── contexts/        React contexts (Lang, Theme)
├── features/        Domain feature modules (colocated by role)
│   ├── admin/
│   ├── assistant/
│   ├── parent/
│   ├── student/
│   └── teacher/
├── hooks/           Shared custom hooks
├── layouts/         Role-specific layout shells
├── lib/             Data layer, permissions, validation, utils
├── pages/           Top-level route pages
├── routes/          Role-gated route wrappers
└── types/           TypeScript type definitions
```

## Conventions

- **Feature colocation**: every role has a `features/<role>/` directory with subdirectories per domain (dashboard, courses, payments, etc.). Pages, hooks, and components for a domain live together.
- **Shared hooks** go in `src/hooks/` (useAuth, useRealtime, useQueries, useMutationFeedback, useDebounce).
- **Shared components** go in `src/components/ui/` (Radix primitives) or `src/components/` (auth, layout).
- **No barrel exports** — files import directly from their source path.
- **TypeScript strict mode** enabled. Database types auto-generated (plus manual additions) in `src/types/database.ts`.
- **i18n** uses a custom `t(key, lang, ...args)` function with three dictionaries (fr, en, ar).
