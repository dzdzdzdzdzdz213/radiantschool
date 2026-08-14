import { lazy, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import PageSuspense from '@/components/ui/PageSuspense';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentLayout from '@/layouts/StudentLayout';
import ParentLayout from '@/layouts/ParentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AssistantLayout from '@/layouts/AssistantLayout';

function loadPage(importFn: () => Promise<{ default: ComponentType }>) {
  return importFn().catch(() => {
    const url = window.location.href.split('?')[0] + '?v=' + Date.now();
    window.location.href = url;
    return { default: () => null };
  });
}

const LoginPage = lazy(() => loadPage(() => import('@/features/auth/LoginPage')));
const StaffLoginPage = lazy(() => loadPage(() => import('@/features/auth/StaffLoginPage')));
const PublicEnrollPage = lazy(() => loadPage(() => import('@/features/auth/PublicEnrollPage')));
const AuthCallbackPage = lazy(() => loadPage(() => import('@/features/auth/AuthCallbackPage')));
const CompleteProfilePage = lazy(() => loadPage(() => import('@/features/auth/CompleteProfilePage')));
const ForgotPasswordPage = lazy(() => loadPage(() => import('@/features/auth/ForgotPasswordPage')));
const ResetPasswordPage = lazy(() => loadPage(() => import('@/features/auth/ResetPasswordPage')));

const LandingPage = lazy(() => loadPage(() => import('@/features/public/LandingPage')));
const PublicCoursesPage = lazy(() => loadPage(() => import('@/features/public/PublicCoursesPage')));
const PrivateRequestPage = lazy(() => loadPage(() => import('@/features/public/PrivateRequestPage')));
const LegalPage = lazy(() => loadPage(() => import('@/features/public/LegalPage')));
const NotFoundPage = lazy(() => loadPage(() => import('@/features/public/NotFoundPage')));
const PublicFaqPage = lazy(() => loadPage(() => import('@/features/public/PublicFaqPage')));
const PublicContactPage = lazy(() => loadPage(() => import('@/features/public/PublicContactPage')));
const LeaderboardPage = lazy(() => loadPage(() => import('@/features/public/LeaderboardPage')));
const PrimaryPage = lazy(() => loadPage(() => import('@/features/public/PrimaryPage')));
const MiddleSchoolPage = lazy(() => loadPage(() => import('@/features/public/MiddleSchoolPage')));
const HighSchoolPage = lazy(() => loadPage(() => import('@/features/public/HighSchoolPage')));
const TeachersPage = lazy(() => loadPage(() => import('@/features/public/TeachersPage')));
const TeacherProfilePage = lazy(() => loadPage(() => import('@/features/public/TeacherProfilePage')));

const StudentDashboardPage = lazy(() => loadPage(() => import('@/features/student/StudentDashboardPage')));
const StudentSchedulePage = lazy(() => loadPage(() => import('@/features/student/StudentSchedulePage')));
const StudentAttendancePage = lazy(() => loadPage(() => import('@/features/student/StudentAttendancePage')));
const StudentPaymentsPage = lazy(() => loadPage(() => import('@/features/student/StudentPaymentsPage')));
const StudentCoursesPage = lazy(() => loadPage(() => import('@/features/student/StudentCoursesPage')));
const StudentEnrollPage = lazy(() => loadPage(() => import('@/features/student/StudentEnrollPage')));
const StudentOnlineClassesPage = lazy(() => loadPage(() => import('@/features/student/StudentOnlineClassesPage')));
const StudentPrivateLessonsPage = lazy(() => loadPage(() => import('@/features/student/StudentPrivateLessonsPage')));
const ParentDashboardPage = lazy(() => loadPage(() => import('@/features/parent/ParentDashboardPage')));
const TeacherDashboardPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherDashboardPage')));
const TeacherCoursesPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherCoursesPage')));
const TeacherSchedulePage = lazy(() => loadPage(() => import('@/features/teacher/TeacherSchedulePage')));
const TeacherStudentsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherStudentsPage')));
const TeacherPrivateLessonsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherPrivateLessonsPage')));
const TeacherAssignmentsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherAssignmentsPage')));
const TeacherAnnouncementsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherAnnouncementsPage')));
const TeacherReviewsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherReviewsPage')));
const TeacherRevenuePage = lazy(() => loadPage(() => import('@/features/teacher/TeacherRevenuePage')));
const TeacherReportsPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherReportsPage')));
const TeacherResourcesPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherResourcesPage')));
const TeacherVipClassesPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherVipClassesPage')));
const TeacherOnlineClassesPage = lazy(() => loadPage(() => import('@/features/teacher/TeacherOnlineClassesPage')));
const AdminDashboardPage = lazy(() => loadPage(() => import('@/features/admin/dashboard/AdminDashboardPage')));
const AssistantDashboardPage = lazy(() => loadPage(() => import('@/features/assistant/dashboard/AssistantDashboardPage')));
const AssistantStudentsPage = lazy(() => loadPage(() => import('@/features/assistant/students/StudentsPage')));
const AssistantParentsPage = lazy(() => loadPage(() => import('@/features/assistant/parents/ParentsPage')));
const AssistantRegistrationsPage = lazy(() => loadPage(() => import('@/features/assistant/registrations/RegistrationsPage')));
const AssistantRfidPage = lazy(() => loadPage(() => import('@/features/assistant/rfid/RfidPage')));
const AssistantGroupsPage = lazy(() => loadPage(() => import('@/features/assistant/groups/GroupsPage')));
const AssistantPrivateLessonsPage = lazy(() => loadPage(() => import('@/features/assistant/private-lessons/AssistantPrivateLessonsPage')));
const AssistantRoomsPage = lazy(() => loadPage(() => import('@/features/assistant/rooms/RoomsPage')));
const AssistantNotificationsPage = lazy(() => loadPage(() => import('@/features/assistant/notifications/NotificationsPage')));
const AssistantEmailsPage = lazy(() => loadPage(() => import('@/features/assistant/emails/EmailsPage')));
const AssistantResourcesPage = lazy(() => loadPage(() => import('@/features/assistant/resources/ResourcesPage')));
const AssistantCampaignsPage = lazy(() => loadPage(() => import('@/features/assistant/campaigns/CampaignsPage')));
const AssistantCalendarPage = lazy(() => loadPage(() => import('@/features/assistant/calendar/CalendarPage')));
const AssistantSearchPage = lazy(() => loadPage(() => import('@/features/assistant/search/SearchPage')));
const AssistantSettingsPage = lazy(() => loadPage(() => import('@/features/assistant/settings/SettingsPage')));
const AssistantAttendancePage = lazy(() => loadPage(() => import('@/features/assistant/attendance/BulkAttendancePage')));
const TeacherAttendancePage = lazy(() => loadPage(() => import('@/features/teacher/TeacherAttendancePage')));

const UsersPage = lazy(() => loadPage(() => import('@/features/admin/UsersPage')));
const CreateUserPage = lazy(() => loadPage(() => import('@/features/admin/CreateUserPage')));
const StudentDetailPage = lazy(() => loadPage(() => import('@/features/public/StudentDetailPage')));
const CoursesPage = lazy(() => loadPage(() => import('@/features/public/CoursesPage')));
const CourseDetailPage = lazy(() => loadPage(() => import('@/features/public/CourseDetailPage')));
const AdminAttendanceOversightPage = lazy(() => loadPage(() => import('@/features/admin/attendance/AdminAttendanceOversightPage')));
const InvoicesPage = lazy(() => loadPage(() => import('@/features/assistant/invoices/InvoicesPage')));
const ReportsPage = lazy(() => loadPage(() => import('@/features/assistant/reports/ReportsPage')));
const MessagesPage = lazy(() => loadPage(() => import('@/features/shared/MessagesPage')));
const SchedulePage = lazy(() => loadPage(() => import('@/features/shared/SchedulePage')));
const ProfilePage = lazy(() => loadPage(() => import('@/features/shared/ProfilePage')));
const SettingsPage = lazy(() => loadPage(() => import('@/features/admin/SettingsPage')));
const HelpPage = lazy(() => loadPage(() => import('@/features/shared/HelpPage')));
const AuditLogPage = lazy(() => loadPage(() => import('@/features/admin/audit/AuditLogPage')));
const LiveLogPage = lazy(() => loadPage(() => import('@/features/admin/audit/LiveLogPage')));
const PayrollPage = lazy(() => loadPage(() => import('@/features/admin/payroll/PayrollPage')));
const AccountingPage = lazy(() => loadPage(() => import('@/features/admin/accounting/AccountingPage')));
const CrmPipelinePage = lazy(() => loadPage(() => import('@/features/assistant/crm/CrmPipelinePage')));
const CrmLeadsPage = lazy(() => loadPage(() => import('@/features/assistant/crm/CrmLeadsPage')));
const CrmLeadDetailPage = lazy(() => loadPage(() => import('@/features/assistant/crm/CrmLeadDetailPage')));
const CrmFollowupsPage = lazy(() => loadPage(() => import('@/features/assistant/crm/CrmFollowupsPage')));
const ChildProgressPage = lazy(() => loadPage(() => import('@/features/parent/ChildProgressPage')));
const HonestyBoxPage = lazy(() => loadPage(() => import('@/features/admin/honesty/HonestyBoxPage')));
const CmsPage = lazy(() => loadPage(() => import('@/features/admin/cms/CmsPage')));
const ComingSoonPage = lazy(() => loadPage(() => import('@/components/ui/ComingSoonPage')));

const websiteRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/staff/login',
    Component: StaffLoginPage,
  },
  {
    path: '/enroll',
    Component: PublicEnrollPage,
  },
  {
    path: '/auth/callback',
    Component: AuthCallbackPage,
  },
  {
    path: '/complete-profile',
    Component: CompleteProfilePage,
  },
  {
    path: '/forgot-password',
    Component: ForgotPasswordPage,
  },
  {
    path: '/reset-password',
    Component: ResetPasswordPage,
  },
  {
    path: '/leaderboard',
    Component: LeaderboardPage,
  },
  {
    path: '/formations',
    Component: PublicCoursesPage,
  },
  {
    path: '/formations-primaire',
    Component: PrimaryPage,
  },
  {
    path: '/formations-cem',
    Component: MiddleSchoolPage,
  },
  {
    path: '/formations-lycee',
    Component: HighSchoolPage,
  },
  {
    path: '/teachers',
    Component: TeachersPage,
  },
  {
    path: '/teachers/:id',
    Component: TeacherProfilePage,
  },
  {
    path: '/faq',
    Component: PublicFaqPage,
  },
  {
    path: '/contact',
    Component: PublicContactPage,
  },
  {
    path: '/private-request/:courseId',
    Component: PrivateRequestPage,
  },
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/mentions-legales',
    Component: LegalPage,
  },
  {
    path: '/cgv',
    Component: LegalPage,
  },
  {
    path: '/confidentialite',
    Component: LegalPage,
  },
];

function routeSuspense(element: ReactNode) {
  return <PageSuspense>{element}</PageSuspense>;
}

const studentRoutes: RouteObject[] = [
  {
    path: '/student',
    element: routeSuspense(<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: StudentDashboardPage },
      { path: 'enroll', Component: StudentEnrollPage },
      { path: 'courses', Component: StudentCoursesPage },
      { path: 'schedule', Component: StudentSchedulePage },
      { path: 'attendance', Component: StudentAttendancePage },
      { path: 'payments', Component: StudentPaymentsPage },
      { path: 'invoices', Component: StudentPaymentsPage },
      { path: 'online-classes', Component: StudentOnlineClassesPage },
      { path: 'private-lessons', Component: StudentPrivateLessonsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'help', Component: HelpPage },
      { path: 'settings', Component: ProfilePage },
      { path: '*', Component: ComingSoonPage },
    ],
  },
];

const parentRoutes: RouteObject[] = [
  {
    path: '/parent',
    element: routeSuspense(<ProtectedRoute allowedRoles={['parent']}><ParentLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: ParentDashboardPage },
      { path: 'enroll', Component: StudentEnrollPage },
      { path: 'progress/:childId', Component: ChildProgressPage },
      { path: 'payments', Component: StudentPaymentsPage },
      { path: 'invoices', Component: StudentPaymentsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'help', Component: HelpPage },
      { path: '*', Component: ComingSoonPage },
    ],
  },
];

const teacherRoutes: RouteObject[] = [
  {
    path: '/teacher',
    element: routeSuspense(<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: TeacherDashboardPage },
      { path: 'courses', Component: TeacherCoursesPage },
      { path: 'schedule', Component: TeacherSchedulePage },
      { path: 'calendar', Component: TeacherSchedulePage },
      { path: 'students', Component: TeacherStudentsPage },
      { path: 'private-lessons', Component: TeacherPrivateLessonsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'messages', Component: MessagesPage },
      { path: 'attendance', Component: TeacherAttendancePage },
      { path: 'assignments', Component: TeacherAssignmentsPage },
      { path: 'homework', Component: TeacherAssignmentsPage },
      { path: 'resources', Component: TeacherResourcesPage },
      { path: 'online-classes', Component: TeacherOnlineClassesPage },
      { path: 'vip-classes', Component: TeacherVipClassesPage },
      { path: 'announcements', Component: TeacherAnnouncementsPage },
      { path: 'reports', Component: TeacherReportsPage },
      { path: 'revenue', Component: TeacherRevenuePage },
      { path: 'reviews', Component: TeacherReviewsPage },
      { path: 'help', Component: HelpPage },
      { path: 'settings', Component: ProfilePage },
      { path: '*', Component: ComingSoonPage },
    ],
  },
];

export const router = createBrowserRouter([
  ...websiteRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...teacherRoutes,
  {
    path: '/admin',
    element: routeSuspense(<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: AdminDashboardPage },
      { path: 'users', Component: UsersPage },
      { path: 'users/new', Component: CreateUserPage },
      { path: 'users/:id', Component: StudentDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'attendance', Component: AdminAttendanceOversightPage },
      { path: 'invoices', Component: InvoicesPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'schedule', Component: SchedulePage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
      { path: 'help', Component: HelpPage },
      { path: 'audit-log', Component: AuditLogPage },
      { path: 'live-log', Component: LiveLogPage },
      { path: 'payroll', Component: PayrollPage },
      { path: 'accounting', Component: AccountingPage },
      { path: 'honesty', Component: HonestyBoxPage },
      { path: 'cms', Component: CmsPage },
    ],
  },
  {
    path: '/assistant',
    element: routeSuspense(<ProtectedRoute allowedRoles={['assistant']}><AssistantLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: AssistantDashboardPage },
      { path: 'students', Component: AssistantStudentsPage },
      { path: 'students/:id', Component: StudentDetailPage },
      { path: 'parents', Component: AssistantParentsPage },
      { path: 'registrations', Component: AssistantRegistrationsPage },
      { path: 'rfid', Component: AssistantRfidPage },
      { path: 'groups', Component: AssistantGroupsPage },
      { path: 'private-lessons', Component: AssistantPrivateLessonsPage },
      { path: 'rooms', Component: AssistantRoomsPage },
      { path: 'notifications', Component: AssistantNotificationsPage },
      { path: 'emails', Component: AssistantEmailsPage },
      { path: 'resources', Component: AssistantResourcesPage },
      { path: 'campaigns', Component: AssistantCampaignsPage },
      { path: 'crm', Component: CrmPipelinePage },
      { path: 'crm/leads', Component: CrmLeadsPage },
      { path: 'crm/leads/:id', Component: CrmLeadDetailPage },
      { path: 'crm/followups', Component: CrmFollowupsPage },
      { path: 'calendar', Component: AssistantCalendarPage },
      { path: 'search', Component: AssistantSearchPage },
      { path: 'settings', Component: AssistantSettingsPage },
      { path: 'attendance', Component: AssistantAttendancePage },
      { path: 'invoices', Component: InvoicesPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'schedule', Component: SchedulePage },
      { path: 'reports', Component: ReportsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'help', Component: HelpPage },
      { path: '*', Component: ComingSoonPage },
    ],
  },
  {
    path: '*',
    element: <PageSuspense><NotFoundPage /></PageSuspense>,
  },
]);
