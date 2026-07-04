# Shared Components

## UI Primitives (`src/components/ui/`)

Radix-based, Shadcn-style components. Each file exports a set of named components.

| File | Exports |
|---|---|
| `button.tsx` | `Button` — variant (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), size (`default`, `sm`, `lg`, `icon`) |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `input.tsx` | `Input` |
| `textarea.tsx` | `Textarea` |
| `label.tsx` | `Label` |
| `select.tsx` | `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| `table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` |
| `badge.tsx` | `Badge` — variant (`default`, `secondary`, `destructive`, `outline`) |
| `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, etc. |
| `sheet.tsx` | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription` |
| `scroll-area.tsx` | `ScrollArea`, `ScrollBar` |
| `separator.tsx` | `Separator` |
| `tooltip.tsx` | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` |
| `switch.tsx` | `Switch` |
| `skeleton.tsx` | `Skeleton` |
| `confirm-dialog.tsx` | `ConfirmDialog` — modal with configurable title, message, confirm/cancel labels |
| `BackButton.tsx` | `BackButton` — navigates to previous route |

All UI components use `class-variance-authority` for variant management and `tailwind-merge` (`cn()` utility) for className merging.

## Auth Components (`src/components/auth/`)

| Component | Description |
|---|---|
| `ProtectedRoute` | Role-based route guard. Props: `allowedRoles: UserRole[]`. Shows spinner while loading, redirects to `/login` if unauthenticated, shows inactive-account page if status is not `active`, redirects to own role dashboard if role is unauthorized. |

## Layout Components (`src/components/layout/`)

| Component | Used By |
|---|---|
| `Sidebar` | Student, Parent |
| `AdminSidebar` | Admin |
| `AdminTopbar` | Admin (top navigation bar) |
| `Header` | Various |

## Shared Widgets (`src/components/`)

| Component | Description |
|---|---|
| `AvatarUpload` | Avatar upload with Supabase Storage integration. Accepts image files, uploads to `avatars` bucket, updates `users.photo_url`. |
| `ErrorBoundary` | React error boundary that catches render errors and shows a fallback UI with retry button. |
| `SafeRedirect` | Navigation guard that uses `useNavigate` for safe redirects (avoids rendering outside router context). |

## Layout Shells (`src/layouts/`)

| File | Content |
|---|---|
| `AdminLayout.tsx` | `AdminSidebar` + `AdminTopbar` + `<Outlet />` |
| `AssistantLayout.tsx` | Sidebar + header + `<Outlet />` |
| `TeacherLayout.tsx` | Sidebar + header + `<Outlet />` |
| `StudentLayout.tsx` | Sidebar + header + `<Outlet />` |
| `ParentLayout.tsx` | Sidebar + header + `<Outlet />` |

## Toast System (`src/components/ui/Toast.tsx`)

Context-based toast notifications:

```typescript
const { toast } = useToast();
toast({ title: t('success.created', lang), variant: 'success' });
```

Supports `success`, `error`, `info` variants. Renders from `ToastProvider` at the app root.
