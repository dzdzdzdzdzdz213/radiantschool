import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentLayout from '@/layouts/StudentLayout';
import ParentLayout from '@/layouts/ParentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AssistantLayout from '@/layouts/AssistantLayout';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const StaffLoginPage = lazy(() => import('@/pages/auth/StaffLoginPage'));
const PublicEnrollPage = lazy(() => import('@/pages/auth/PublicEnrollPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const CompleteProfilePage = lazy(() => import('@/pages/auth/CompleteProfilePage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PublicCoursesPage = lazy(() => import('@/pages/PublicCoursesPage'));
const PrivateRequestPage = lazy(() => import('@/pages/PrivateRequestPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const PublicFaqPage = lazy(() => import('@/pages/PublicFaqPage'));
const PublicContactPage = lazy(() => import('@/pages/PublicContactPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const PrimaryPage = lazy(() => import('@/pages/formations/PrimaryPage'));
const MiddleSchoolPage = lazy(() => import('@/pages/formations/MiddleSchoolPage'));
const HighSchoolPage = lazy(() => import('@/pages/formations/HighSchoolPage'));
const TeachersPage = lazy(() => import('@/pages/formations/TeachersPage'));
const TeacherProfilePage = lazy(() => import('@/pages/formations/TeacherProfilePage'));

const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage'));
const StudentSchedulePage = lazy(() => import('@/pages/student/StudentSchedulePage'));
const StudentAttendancePage = lazy(() => import('@/pages/student/StudentAttendancePage'));
const StudentPaymentsPage = lazy(() => import('@/pages/student/StudentPaymentsPage'));
const StudentCoursesPage = lazy(() => import('@/pages/student/StudentCoursesPage'));
const StudentEnrollPage = lazy(() => import('@/pages/student/StudentEnrollPage'));
const ParentDashboardPage = lazy(() => import('@/pages/parent/ParentDashboardPage'));
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'));
const TeacherCoursesPage = lazy(() => import('@/pages/teacher/TeacherCoursesPage'));
const TeacherSchedulePage = lazy(() => import('@/pages/teacher/TeacherSchedulePage'));
const TeacherStudentsPage = lazy(() => import('@/pages/teacher/TeacherStudentsPage'));
const TeacherPrivateLessonsPage = lazy(() => import('@/pages/teacher/TeacherPrivateLessonsPage'));
const TeacherAssignmentsPage = lazy(() => import('@/pages/teacher/TeacherAssignmentsPage'));
const TeacherAnnouncementsPage = lazy(() => import('@/pages/teacher/TeacherAnnouncementsPage'));
const TeacherReviewsPage = lazy(() => import('@/pages/teacher/TeacherReviewsPage'));
const TeacherRevenuePage = lazy(() => import('@/pages/teacher/TeacherRevenuePage'));
const TeacherReportsPage = lazy(() => import('@/pages/teacher/TeacherReportsPage'));
const TeacherResourcesPage = lazy(() => import('@/pages/teacher/TeacherResourcesPage'));
const TeacherVipClassesPage = lazy(() => import('@/pages/teacher/TeacherVipClassesPage'));
const TeacherOnlineClassesPage = lazy(() => import('@/pages/teacher/TeacherOnlineClassesPage'));
const AdminDashboardPage = lazy(() => import('@/features/dashboard/AdminDashboardPage'));
const AssistantDashboardPage = lazy(() => import('@/features/assistant/dashboard/AssistantDashboardPage'));
const AssistantStudentsPage = lazy(() => import('@/features/assistant/students/StudentsPage'));
const AssistantParentsPage = lazy(() => import('@/features/assistant/parents/ParentsPage'));
const AssistantRegistrationsPage = lazy(() => import('@/features/assistant/registrations/RegistrationsPage'));
const AssistantRfidPage = lazy(() => import('@/features/assistant/rfid/RfidPage'));
const AssistantGroupsPage = lazy(() => import('@/features/assistant/groups/GroupsPage'));
const AssistantPrivateLessonsPage = lazy(() => import('@/features/assistant/private-lessons/AssistantPrivateLessonsPage'));
const AssistantRoomsPage = lazy(() => import('@/features/assistant/rooms/RoomsPage'));
const AssistantNotificationsPage = lazy(() => import('@/features/assistant/notifications/NotificationsPage'));
const AssistantEmailsPage = lazy(() => import('@/features/assistant/emails/EmailsPage'));
const AssistantResourcesPage = lazy(() => import('@/features/assistant/resources/ResourcesPage'));
const AssistantCampaignsPage = lazy(() => import('@/features/assistant/campaigns/CampaignsPage'));
const AssistantCalendarPage = lazy(() => import('@/features/assistant/calendar/CalendarPage'));
const AssistantSearchPage = lazy(() => import('@/features/assistant/search/SearchPage'));
const AssistantSettingsPage = lazy(() => import('@/features/assistant/settings/SettingsPage'));
const AssistantAttendancePage = lazy(() => import('@/features/assistant/attendance/AttendancePage'));

const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const AdminCreateUserPage = lazy(() => import('@/pages/admin/CreateUserPage'));
const AdminStudentDetailPage = lazy(() => import('@/pages/StudentDetailPage'));
const AssistantStudentDetailPage = lazy(() => import('@/pages/StudentDetailPage'));
const AdminCoursesPage = lazy(() => import('@/pages/CoursesPage'));
const AdminCourseDetailPage = lazy(() => import('@/pages/CourseDetailPage'));
const AdminAttendanceOversightPage = lazy(() => import('@/features/admin/attendance/AdminAttendanceOversightPage'));
const AdminPaymentsPage = lazy(() => import('@/features/assistant/payments/PaymentsPage'));
const AdminInvoicesPage = lazy(() => import('@/features/assistant/invoices/InvoicesPage'));
const AdminReportsPage = lazy(() => import('@/features/assistant/reports/ReportsPage'));
const AdminMessagesPage = lazy(() => import('@/pages/MessagesPage'));
const AdminSchedulePage = lazy(() => import('@/pages/SchedulePage'));
const AdminProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const AdminHelpPage = lazy(() => import('@/pages/HelpPage'));

function ComingSoon({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold mb-2">{label || 'Page en cours de développement'}</h2>
      <p className="text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  );
}

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

const studentRoutes: RouteObject[] = [
  {
    path: '/student',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: StudentDashboardPage },
      { path: 'enroll', Component: StudentEnrollPage },
      { path: 'courses', Component: StudentCoursesPage },
      { path: 'schedule', Component: StudentSchedulePage },
      { path: 'calendar', Component: StudentSchedulePage },
      { path: 'attendance', Component: StudentAttendancePage },
      { path: 'payments', Component: StudentPaymentsPage },
      { path: 'invoices', Component: StudentPaymentsPage },
      { path: 'messages', Component: AdminMessagesPage },
      { path: 'profile', Component: AdminProfilePage },
      { path: '*', Component: ComingSoon },
    ],
  },
];

const parentRoutes: RouteObject[] = [
  {
    path: '/parent',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <ProtectedRoute allowedRoles={['parent']}>
          <ParentLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: ParentDashboardPage },
      { path: 'enroll', Component: StudentEnrollPage },
      { path: 'payments', Component: StudentPaymentsPage },
      { path: 'invoices', Component: StudentPaymentsPage },
      { path: 'messages', Component: AdminMessagesPage },
      { path: 'profile', Component: AdminProfilePage },
      { path: '*', Component: ComingSoon },
    ],
  },
];

const teacherRoutes: RouteObject[] = [
  {
    path: '/teacher',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: TeacherDashboardPage },
      { path: 'courses', Component: TeacherCoursesPage },
      { path: 'schedule', Component: TeacherSchedulePage },
      { path: 'calendar', Component: TeacherSchedulePage },
      { path: 'students', Component: TeacherStudentsPage },
      { path: 'private-lessons', Component: TeacherPrivateLessonsPage },
      { path: 'profile', Component: AdminProfilePage },
      { path: 'messages', Component: AdminMessagesPage },
      { path: 'attendance', Component: AdminAttendanceOversightPage },
      { path: 'assignments', Component: TeacherAssignmentsPage },
      { path: 'homework', Component: TeacherAssignmentsPage },
      { path: 'resources', Component: TeacherResourcesPage },
      { path: 'online-classes', Component: TeacherOnlineClassesPage },
      { path: 'vip-classes', Component: TeacherVipClassesPage },
      { path: 'announcements', Component: TeacherAnnouncementsPage },
      { path: 'reports', Component: TeacherReportsPage },
      { path: 'revenue', Component: TeacherRevenuePage },
      { path: 'reviews', Component: TeacherReviewsPage },
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
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: AdminDashboardPage },
      { path: 'users', Component: AdminUsersPage },
      { path: 'users/new', Component: AdminCreateUserPage },
      { path: 'users/:id', Component: AdminStudentDetailPage },
      { path: 'courses', Component: AdminCoursesPage },
      { path: 'courses/:id', Component: AdminCourseDetailPage },
      { path: 'attendance', Component: AdminAttendanceOversightPage },
      { path: 'payments', Component: AdminPaymentsPage },
      { path: 'invoices', Component: AdminInvoicesPage },
      { path: 'reports', Component: AdminReportsPage },
      { path: 'messages', Component: AdminMessagesPage },
      { path: 'schedule', Component: AdminSchedulePage },
      { path: 'profile', Component: AdminProfilePage },
      { path: 'settings', Component: AdminSettingsPage },
      { path: 'help', Component: AdminHelpPage },
    ],
  },
  {
    path: '/assistant',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <ProtectedRoute allowedRoles={['assistant']}>
          <AssistantLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: AssistantDashboardPage },
      { path: 'students', Component: AssistantStudentsPage },
      { path: 'students/:id', Component: AssistantStudentDetailPage },
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
      { path: 'calendar', Component: AssistantCalendarPage },
      { path: 'search', Component: AssistantSearchPage },
      { path: 'settings', Component: AssistantSettingsPage },
      { path: 'attendance', Component: AssistantAttendancePage },
      { path: 'payments', Component: AdminPaymentsPage },
      { path: 'invoices', Component: AdminInvoicesPage },
      { path: 'messages', Component: AdminMessagesPage },
      { path: 'schedule', Component: AdminSchedulePage },
      { path: 'reports', Component: AdminReportsPage },
      { path: 'profile', Component: AdminProfilePage },
      { path: '*', Component: ComingSoon },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
