import { lazy, Suspense } from 'react';
import { createMemoryRouter, Navigate } from 'react-router-dom';
import SafeRedirect from '@/components/SafeRedirect';

const LazyPage = (imp: any) => {
  const C = lazy(imp);
  return () => (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <C />
    </Suspense>
  );
};

const AdminRoute = lazy(() => import('@/routes/AdminRoute'));
const AssistantRoute = lazy(() => import('@/routes/AssistantRoute'));
const StaffLoginPage = lazy(() => import('@/pages/auth/StaffLoginPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminDashboardPage = LazyPage(() => import('@/features/dashboard/AdminDashboardPage'));
const AssistantDashboardPage = LazyPage(() => import('@/features/assistant/dashboard/AssistantDashboardPage'));
const StudentsPage = LazyPage(() => import('@/features/assistant/students/StudentsPage'));
const ParentsPage = LazyPage(() => import('@/features/assistant/parents/ParentsPage'));
const RegistrationsPage = LazyPage(() => import('@/features/assistant/registrations/RegistrationsPage'));
const AttendancePage = LazyPage(() => import('@/features/assistant/attendance/AttendancePage'));
const AdminAttendanceOversightPage = LazyPage(() => import('@/features/admin/attendance/AdminAttendanceOversightPage'));
const RfidPage = LazyPage(() => import('@/features/assistant/rfid/RfidPage'));
const GroupsPage = LazyPage(() => import('@/features/assistant/groups/GroupsPage'));
const SchedulesPage = LazyPage(() => import('@/features/assistant/schedules/SchedulesPage'));
const RoomsPage = LazyPage(() => import('@/features/assistant/rooms/RoomsPage'));
const PaymentsPage = LazyPage(() => import('@/features/assistant/payments/PaymentsPage'));
const InvoicesPage = LazyPage(() => import('@/features/assistant/invoices/InvoicesPage'));
const NotificationsPage = LazyPage(() => import('@/features/assistant/notifications/NotificationsPage'));
const EmailsPage = LazyPage(() => import('@/features/assistant/emails/EmailsPage'));
const ResourcesPage = LazyPage(() => import('@/features/assistant/resources/ResourcesPage'));
const CampaignsPage = LazyPage(() => import('@/features/assistant/campaigns/CampaignsPage'));
const ReportsPage = LazyPage(() => import('@/features/assistant/reports/ReportsPage'));
const CalendarPage = LazyPage(() => import('@/features/assistant/calendar/CalendarPage'));
const SearchPage = LazyPage(() => import('@/features/assistant/search/SearchPage'));
const AssistantPrivateLessonsPage = LazyPage(() => import('@/features/assistant/private-lessons/AssistantPrivateLessonsPage'));
const AssistantSettingsPage = LazyPage(() => import('@/features/assistant/settings/SettingsPage'));
const UsersPage = LazyPage(() => import('@/pages/admin/UsersPage'));
const CreateUserPage = LazyPage(() => import('@/pages/admin/CreateUserPage'));
const CoursesPage = LazyPage(() => import('@/pages/CoursesPage'));
const CourseDetailPage = LazyPage(() => import('@/pages/CourseDetailPage'));
const MessagesPage = LazyPage(() => import('@/pages/MessagesPage'));
const ProfilePage = LazyPage(() => import('@/pages/ProfilePage'));
const HelpPage = LazyPage(() => import('@/pages/HelpPage'));
const SettingsPage = LazyPage(() => import('@/pages/admin/SettingsPage'));
const StudentDetailPage = LazyPage(() => import('@/pages/StudentDetailPage'));
const SchedulePage = LazyPage(() => import('@/pages/SchedulePage'));

export const desktopRouter = createMemoryRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    Component: StaffLoginPage,
  },
  {
    path: '/auth/callback',
    Component: AuthCallbackPage,
  },
  {
    path: '/admin',
    Component: () => (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <AdminRoute />
      </Suspense>
    ),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: AdminDashboardPage },
      { path: 'users', Component: UsersPage },
      { path: 'users/new', Component: CreateUserPage },
      { path: 'users/:id', Component: StudentDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'attendance', Component: AdminAttendanceOversightPage },
      { path: 'payments', Component: PaymentsPage },
      { path: 'invoices', Component: InvoicesPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'schedule', Component: SchedulePage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
      { path: 'help', Component: HelpPage },
    ],
  },
  {
    path: '/assistant',
    Component: () => (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <AssistantRoute />
      </Suspense>
    ),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: AssistantDashboardPage },
      { path: 'students', Component: StudentsPage },
      { path: 'students/new', Component: StudentsPage },
      { path: 'students/:id', Component: StudentDetailPage },
      { path: 'parents', Component: ParentsPage },
      { path: 'parents/new', Component: ParentsPage },
      { path: 'parents/:id', Component: StudentDetailPage },
      { path: 'registrations', Component: RegistrationsPage },
      { path: 'attendance', Component: AttendancePage },
      { path: 'rfid', Component: RfidPage },
      { path: 'groups', Component: GroupsPage },
      { path: 'schedules', Component: SchedulesPage },
      { path: 'rooms', Component: RoomsPage },
      { path: 'payments', Component: PaymentsPage },
      { path: 'payments/new', Component: PaymentsPage },
      { path: 'invoices', Component: InvoicesPage },
      { path: 'invoices/new', Component: InvoicesPage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'emails', Component: EmailsPage },
      { path: 'resources', Component: ResourcesPage },
      { path: 'campaigns', Component: CampaignsPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'calendar', Component: CalendarPage },
      { path: 'search', Component: SearchPage },
      { path: 'settings', Component: AssistantSettingsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'help', Component: HelpPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'private-lessons', Component: AssistantPrivateLessonsPage },
      { path: 'messages', Component: MessagesPage },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
