# Dashboard Architecture

Each role has a dedicated dashboard composed of:

1. **A hook** (`useXxxDashboard`) that queries Supabase and returns `{ kpi, isLoading, isError }`.
2. **A page** (`XxxDashboardPage.tsx`) that renders the layout and passes data to widgets.
3. **Child components** (one per widget) that receive typed props.

## Admin Dashboard — `src/features/dashboard/`

### Hook: `useAdminDashboard()`

Composes 8 data streams:

| Stream | Source |
|---|---|
| Realtime subscriptions | `useRealtimeDashboard()` |
| KPIs | `useDashboardKPI()` from shared queries |
| Revenue chart | `useRevenueChartData()` — 30-day aggregation |
| Occupancy | `useOccupancyData()` — course fill rates |
| Today's schedule | `useTodaySchedule()` |
| Recent activity | `useRecentActivity()` — combined event log |
| Alerts | `useAdminAlerts()` — pending, overdue, near-full |
| Registrations | Direct `api.list` on `users` |
| Attendance summary | Direct query on `attendance` |

### Widgets

`KpiCard`, `RevenueChartWidget`, `OccupancyChartWidget`, `ActivityTimeline`, `TodaySchedule`, `QuickActions`, `RecentRegistrationsTable`, `AttendanceWidget`, `AnalyticsWidget`, `AlertBanner`.

## Teacher Dashboard — `src/features/teacher/dashboard/`

### Hook: `useTeacherDashboard()`

Uses `profile.id` to scope queries. Exposes 17 KPI metrics:

| Metric | Source |
|---|---|
| Active students | Enrollment count for teacher's courses |
| Today's classes | Course schedules filtered to today |
| Attendance rate | Average attendance across all classes |
| Assignments pending | Ungraded submissions |
| Teaching hours (month) | Sum of schedule durations for current month |
| Revenue (month) | Sum of payments linked to teacher |
| Private lessons count | Count from `private_lessons` |
| VIP classes count | Count from `vip_classes` |

## Student Dashboard — `src/features/student/dashboard/`

### Hook: `useStudentDashboard()`

Exposes 22 metrics including:

- Enrolled courses count
- Attendance rate (present / total)
- Homework pending / completed
- Total payments made
- Outstanding invoices
- Average grade (from evaluations)
- Next class (time, course, room)
- Private/VIP lesson counts
- Certificate count
- Auto-refetches every 30 seconds.

## Parent Dashboard — `src/features/parent/dashboard/`

### Hook: `useParentDashboard()`

Multi-step data flow:

1. Fetch linked children via `student_parent` table → `childrenQuery`
2. For each child, aggregate KPIs (attendance, homework, invoices, notifications) → `kpiQuery`
3. Today's classes across all children → `upcomingClassesQuery`
4. Last 10 payments → `recentPaymentsQuery`
5. Last 10 invoices → `invoicesQuery`
6. Recent homework → `homeworkQuery`
7. 30-day activity timeline → `activityQuery`
8. Parent's own notifications → `notificationsQuery`

### Widgets

`ChildrenOverview`, `KpiCards`, `UpcomingClasses`, `AttendanceSummary`, `RecentPayments`, `InvoicesSummary`, `HomeworkStatus`, `ActivityTimeline`, `NotificationsWidget`, `QuickActions`.

## Assistant Dashboard — `src/features/assistant/dashboard/`

### Hook: `useAssistantDashboard()`

Exposes 13 data streams:

- KPI stats via `api.rpc('get_dashboard_stats')` with 0 fallback
- Pending registrations, overdue payments, room status
- Active teachers (currently teaching), today's schedule
- RFID scans, alerts
- 10 hardcoded quick actions with labels, icons, paths

### Widgets

`KpiCards`, `PendingRegistrations`, `OverduePayments`, `RoomOccupancy`, `ActiveTeachers`, `TodaySchedule`, `RfidSummary`, `AlertsWidget`, `QuickActions`.

## Performance Configuration

All dashboard hooks use explicit `staleTime` and `gcTime`:

- Admin: `staleTime: 120_000`, `gcTime: 300_000`
- Teacher: `staleTime: 60_000`, `gcTime: 300_000`
- Student: `staleTime: 30_000`, `gcTime: 300_000` (auto-refetch)
- Parent: `staleTime: 60_000`, `gcTime: 300_000`
- Assistant: `staleTime: 60_000`, `gcTime: 300_000`
