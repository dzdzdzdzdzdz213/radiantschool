# Custom Hooks

## `useAuth()` — `src/hooks/useAuth.tsx`

Authentication context provider and hook. See [AUTH.md](./AUTH.md) for full reference.

## `useRealtime()` — `src/hooks/useRealtime.ts`

| Export | Description |
|---|---|
| `useRealtimeSubscription(table, filter, queryKey)` | Subscribes to Postgres changes on a table; invalidates given query keys on insert/update/delete. Returns `{ isSubscribed, error }`. |
| `useRealtimeDashboard()` | Convenience wrapper — subscribes to payments, attendance, course_enrollments, users, notifications, invoices, courses, messages. Returns `{ isSubscribed, error }`. |

Both use a stable subscription identity via `useRef` to avoid re-subscribing on re-render.

## `useQueries()` — `src/hooks/useQueries.ts`

Central repository of TanStack Query hooks. Each hook uses `api.list` or `api.get` from the data layer.

| Hook | Query Key | Description |
|---|---|---|
| `useUsers(params?)` | `['users', params]` | Paginated user list |
| `useStudents(params?)` | `['students', params]` | Paginated students |
| `useCourses(params?)` | `['courses', params]` | Paginated courses with relations |
| `useCourse(id)` | `['courses', id]` | Single course by ID |
| `useCourseEnrollments(courseId)` | `['course_enrollments', courseId]` | Enrollments for a course |
| `useAttendance(params)` | `['attendance', params]` | Attendance records with filters |
| `usePayments(params?)` | `['payments', params]` | Payment records |
| `useInvoices(params?)` | `['invoices', params]` | Invoice records |
| `useDashboardKPI()` | `['dashboard_kpi']` | Aggregated KPIs from `dashboard_kpi` view |
| `useNotifications(userId)` | `['notifications', userId]` | User notifications |
| `useMessages(conversationId)` | `['messages', conversationId]` | Messages in a conversation |
| `useLevels()` | `['levels']` | All academic levels |
| `useSubjects()` | `['subjects']` | All subjects |
| `useRooms()` | `['rooms']` | All rooms |
| `useRevenueChartData()` | `['revenue_chart']` | 30-day revenue aggregation |
| `useOccupancyData()` | `['occupancy']` | Course occupancy percentages |
| `useTodaySchedule()` | `['today_schedule']` | Today's schedule with relations |
| `useRecentActivity()` | `['recent_activity']` | Combined enrollments + payments + attendance |
| `useAdminAlerts()` | `['admin_alerts']` | Pending approvals, overdue invoices, full courses |

## `usePublicData()` — `src/hooks/usePublicData.ts`

For the unauthenticated landing page:

| Hook | Description |
|---|---|
| `usePublicCourses()` | Active courses with subject/level/teacher info |
| `usePublicStats()` | Student/teacher counts, average rating, success rate, years active |

## `useMutationFeedback()` — `src/hooks/useMutationFeedback.ts`

Mutation helpers wired to the toast notification system.

| Export | Description |
|---|---|
| `useMutationWithFeedback(options)` | Generic mutation wrapper. Shows success/error toasts, auto-invalidates query keys on success. Options: `mutationFn`, `successKey` (i18n key), `errorKey`, `invalidatedKeys`. |
| `useUpdateUserSettings()` | Update user profile + settings |
| `useUpdatePassword()` | Change password via Supabase auth |
| `useSendMessage()` | Send a message (creates or continues conversation) |
| `useDownloadFile()` | Download file from Supabase Storage |
| `useMarkNotificationsRead()` | Mark notifications as read |
| `useDeleteNotification()` | Delete a notification |
| `useSubmitReview()` | Submit a teacher evaluation/review |

## `useDebounce()` — `src/hooks/useDebounce.ts`

```typescript
useDebounce<T>(value: T, delay: number): T
```

Returns a debounced version of the value. Updates propagate only after the specified delay of inactivity.
