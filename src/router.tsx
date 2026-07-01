import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AssistantLayout = lazy(() => import('@/layouts/AssistantLayout'));
const TeacherLayout = lazy(() => import('@/layouts/TeacherLayout'));
const StudentLayout = lazy(() => import('@/layouts/StudentLayout'));
const ParentLayout = lazy(() => import('@/layouts/ParentLayout'));

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('@/features/dashboard/AdminDashboardPage'));
const AssistantDashboardPage = lazy(() => import('@/features/assistant/dashboard/AssistantDashboardPage'));
const StudentsPage = lazy(() => import('@/features/assistant/students/StudentsPage'));
const ParentsPage = lazy(() => import('@/features/assistant/parents/ParentsPage'));
const RegistrationsPage = lazy(() => import('@/features/assistant/registrations/RegistrationsPage'));
const AttendancePage = lazy(() => import('@/features/assistant/attendance/AttendancePage'));
const RfidPage = lazy(() => import('@/features/assistant/rfid/RfidPage'));
const GroupsPage = lazy(() => import('@/features/assistant/groups/GroupsPage'));
const SchedulesPage = lazy(() => import('@/features/assistant/schedules/SchedulesPage'));
const RoomsPage = lazy(() => import('@/features/assistant/rooms/RoomsPage'));
const PaymentsPage = lazy(() => import('@/features/assistant/payments/PaymentsPage'));
const InvoicesPage = lazy(() => import('@/features/assistant/invoices/InvoicesPage'));
const NotificationsPage = lazy(() => import('@/features/assistant/notifications/NotificationsPage'));
const EmailsPage = lazy(() => import('@/features/assistant/emails/EmailsPage'));
const ResourcesPage = lazy(() => import('@/features/assistant/resources/ResourcesPage'));
const CampaignsPage = lazy(() => import('@/features/assistant/campaigns/CampaignsPage'));
const ReportsPage = lazy(() => import('@/features/assistant/reports/ReportsPage'));
const CalendarPage = lazy(() => import('@/features/assistant/calendar/CalendarPage'));
const SearchPage = lazy(() => import('@/features/assistant/search/SearchPage'));
const AssistantSettingsPage = lazy(() => import('@/features/assistant/settings/SettingsPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('@/pages/CourseDetailPage'));
const AttendancePageOld = lazy(() => import('@/pages/AttendancePage'));
const PaymentsPageOld = lazy(() => import('@/pages/PaymentsPage'));
const InvoicesPageOld = lazy(() => import('@/pages/InvoicesPage'));
const ReportsPageOld = lazy(() => import('@/pages/ReportsPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const SchedulePageOld = lazy(() => import('@/pages/SchedulePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const TeacherEvaluationsPage = lazy(() => import('@/pages/TeacherEvaluationsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const StudentDetailPage = lazy(() => import('@/pages/StudentDetailPage'));
const StudentReviewsPageOld = lazy(() => import('@/pages/student/StudentReviewsPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const EnrollPage = lazy(() => import('@/pages/EnrollPage'));
const TeacherDashboardPage = lazy(() => import('@/features/teacher/dashboard/TeacherDashboardPage'));
const TeacherStudentsPage = lazy(() => import('@/features/teacher/students/TeacherStudentsPage'));
const TeacherSchedulePage = lazy(() => import('@/features/teacher/schedule/SchedulePage'));
const TeacherCalendarPage = lazy(() => import('@/features/teacher/calendar/CalendarPage'));
const TeacherAttendancePage = lazy(() => import('@/features/teacher/attendance/TeacherAttendancePage'));
const TeacherAssignmentsPage = lazy(() => import('@/features/teacher/assignments/AssignmentsPage'));
const TeacherHomeworkPage = lazy(() => import('@/features/teacher/homework/HomeworkPage'));
const TeacherResourcesPage = lazy(() => import('@/features/teacher/resources/ResourcesPage'));
const TeacherOnlineClassesPage = lazy(() => import('@/features/teacher/online-classes/OnlineClassesPage'));
const TeacherPrivateLessonsPage = lazy(() => import('@/features/teacher/private-lessons/PrivateLessonsPage'));
const TeacherVipClassesPage = lazy(() => import('@/features/teacher/vip-classes/VipClassesPage'));
const TeacherAnnouncementsPage = lazy(() => import('@/features/teacher/announcements/AnnouncementsPage'));
const TeacherMessagesPage = lazy(() => import('@/features/teacher/messages/MessagesPage'));
const TeacherReportsPage = lazy(() => import('@/features/teacher/reports/ReportsPage'));
const TeacherRevenuePage = lazy(() => import('@/features/teacher/revenue/RevenuePage'));
const TeacherReviewsPage = lazy(() => import('@/features/teacher/reviews/ReviewsPage'));
const TeacherProfilePage = lazy(() => import('@/features/teacher/profile/TeacherProfilePage'));
const TeacherSettingsPage = lazy(() => import('@/features/teacher/settings/TeacherSettingsPage'));
const StudentDashboardPage = lazy(() => import('@/features/student/dashboard/StudentDashboardPage'));
const StudentCoursesPage = lazy(() => import('@/features/student/courses/StudentCoursesPage'));
const StudentSchedulePage = lazy(() => import('@/features/student/schedule/StudentSchedulePage'));
const StudentCalendarPage = lazy(() => import('@/features/student/calendar/StudentCalendarPage'));
const StudentAttendancePage = lazy(() => import('@/features/student/attendance/StudentAttendancePage'));
const StudentHomeworkPage = lazy(() => import('@/features/student/homework/StudentHomeworkPage'));
const StudentResourcesPage = lazy(() => import('@/features/student/resources/StudentResourcesPage'));
const StudentOnlineClassesPage = lazy(() => import('@/features/student/online-classes/StudentOnlineClassesPage'));
const StudentPrivateLessonsPage = lazy(() => import('@/features/student/private-lessons/StudentPrivateLessonsPage'));
const StudentVipClassesPage = lazy(() => import('@/features/student/vip-classes/StudentVipClassesPage'));
const StudentPaymentsPage = lazy(() => import('@/features/student/payments/StudentPaymentsPage'));
const StudentInvoicesPage = lazy(() => import('@/features/student/invoices/StudentInvoicesPage'));
const StudentCertificatesPage = lazy(() => import('@/features/student/certificates/StudentCertificatesPage'));
const StudentAnnouncementsPage = lazy(() => import('@/features/student/announcements/StudentAnnouncementsPage'));
const StudentMessagesPage = lazy(() => import('@/features/student/messages/StudentMessagesPage'));
const StudentNotificationsPage = lazy(() => import('@/features/student/notifications/StudentNotificationsPage'));
const StudentReviewsPage = lazy(() => import('@/features/student/reviews/StudentReviewsPage'));
const StudentProfilePage = lazy(() => import('@/features/student/profile/StudentProfilePage'));
const StudentSettingsPage = lazy(() => import('@/features/student/settings/StudentSettingsPage'));

export const router = createBrowserRouter([
  {
    path: '/login/:role?',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:id', element: <StudentDetailPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'schedule', element: <SchedulePageOld /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/assistant',
    element: (
      <ProtectedRoute allowedRoles={['assistant']}>
        <AssistantLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AssistantDashboardPage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'students/new', element: <StudentsPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'parents', element: <ParentsPage /> },
      { path: 'parents/new', element: <ParentsPage /> },
      { path: 'parents/:id', element: <StudentDetailPage /> },
      { path: 'registrations', element: <RegistrationsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'rfid', element: <RfidPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'schedules', element: <SchedulesPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'payments/new', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'invoices/new', element: <InvoicesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'emails', element: <EmailsPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'settings', element: <AssistantSettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'messages', element: <MessagesPage /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'students', element: <TeacherStudentsPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'attendance', element: <TeacherAttendancePage /> },
      { path: 'schedule', element: <TeacherSchedulePage /> },
      { path: 'calendar', element: <TeacherCalendarPage /> },
      { path: 'assignments', element: <TeacherAssignmentsPage /> },
      { path: 'homework', element: <TeacherHomeworkPage /> },
      { path: 'resources', element: <TeacherResourcesPage /> },
      { path: 'online-classes', element: <TeacherOnlineClassesPage /> },
      { path: 'private-lessons', element: <TeacherPrivateLessonsPage /> },
      { path: 'vip-classes', element: <TeacherVipClassesPage /> },
      { path: 'announcements', element: <TeacherAnnouncementsPage /> },
      { path: 'messages', element: <TeacherMessagesPage /> },
      { path: 'reports', element: <TeacherReportsPage /> },
      { path: 'revenue', element: <TeacherRevenuePage /> },
      { path: 'reviews', element: <TeacherReviewsPage /> },
      { path: 'evaluations', element: <TeacherEvaluationsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile', element: <TeacherProfilePage /> },
      { path: 'settings', element: <TeacherSettingsPage /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboardPage /> },
      { path: 'courses', element: <StudentCoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'schedule', element: <StudentSchedulePage /> },
      { path: 'calendar', element: <StudentCalendarPage /> },
      { path: 'attendance', element: <StudentAttendancePage /> },
      { path: 'homework', element: <StudentHomeworkPage /> },
      { path: 'resources', element: <StudentResourcesPage /> },
      { path: 'online-classes', element: <StudentOnlineClassesPage /> },
      { path: 'private-lessons', element: <StudentPrivateLessonsPage /> },
      { path: 'vip-classes', element: <StudentVipClassesPage /> },
      { path: 'payments', element: <StudentPaymentsPage /> },
      { path: 'invoices', element: <StudentInvoicesPage /> },
      { path: 'certificates', element: <StudentCertificatesPage /> },
      { path: 'announcements', element: <StudentAnnouncementsPage /> },
      { path: 'messages', element: <StudentMessagesPage /> },
      { path: 'notifications', element: <StudentNotificationsPage /> },
      { path: 'reviews', element: <StudentReviewsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
      { path: 'settings', element: <StudentSettingsPage /> },
    ],
  },
  {
    path: '/parent',
    element: (
      <ProtectedRoute allowedRoles={['parent']}>
        <ParentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'children', element: <CoursesPage /> },
      { path: 'children/:id', element: <StudentDetailPage /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'payments', element: <PaymentsPageOld /> },
      { path: 'invoices', element: <InvoicesPageOld /> },
      { path: 'schedule', element: <SchedulePageOld /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/leaderboard',
    element: <LeaderboardPage />,
  },
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
