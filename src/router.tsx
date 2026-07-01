import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import AdminLayout from '@/layouts/AdminLayout';
import AssistantLayout from '@/layouts/AssistantLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import StudentLayout from '@/layouts/StudentLayout';
import ParentLayout from '@/layouts/ParentLayout';
import DashboardPage from '@/pages/DashboardPage';
import AdminDashboardPage from '@/features/dashboard/AdminDashboardPage';
import AssistantDashboardPage from '@/features/assistant/dashboard/AssistantDashboardPage';
import StudentsPage from '@/features/assistant/students/StudentsPage';
import ParentsPage from '@/features/assistant/parents/ParentsPage';
import RegistrationsPage from '@/features/assistant/registrations/RegistrationsPage';
import AttendancePage from '@/features/assistant/attendance/AttendancePage';
import RfidPage from '@/features/assistant/rfid/RfidPage';
import GroupsPage from '@/features/assistant/groups/GroupsPage';
import SchedulesPage from '@/features/assistant/schedules/SchedulesPage';
import RoomsPage from '@/features/assistant/rooms/RoomsPage';
import PaymentsPage from '@/features/assistant/payments/PaymentsPage';
import InvoicesPage from '@/features/assistant/invoices/InvoicesPage';
import NotificationsPage from '@/features/assistant/notifications/NotificationsPage';
import EmailsPage from '@/features/assistant/emails/EmailsPage';
import ResourcesPage from '@/features/assistant/resources/ResourcesPage';
import CampaignsPage from '@/features/assistant/campaigns/CampaignsPage';
import ReportsPage from '@/features/assistant/reports/ReportsPage';
import CalendarPage from '@/features/assistant/calendar/CalendarPage';
import SearchPage from '@/features/assistant/search/SearchPage';
import AssistantSettingsPage from '@/features/assistant/settings/SettingsPage';
import UsersPage from '@/pages/admin/UsersPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import AttendancePageOld from '@/pages/AttendancePage';
import PaymentsPageOld from '@/pages/PaymentsPage';
import InvoicesPageOld from '@/pages/InvoicesPage';
import ReportsPageOld from '@/pages/ReportsPage';
import MessagesPage from '@/pages/MessagesPage';
import SchedulePageOld from '@/pages/SchedulePage';
import ProfilePage from '@/pages/ProfilePage';
import TeacherEvaluationsPage from '@/pages/TeacherEvaluationsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import StudentReviewsPage from '@/pages/student/StudentReviewsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import EnrollPage from '@/pages/EnrollPage';
import TeacherDashboardPage from '@/features/teacher/dashboard/TeacherDashboardPage';
import TeacherStudentsPage from '@/features/teacher/students/TeacherStudentsPage';
import TeacherSchedulePage from '@/features/teacher/schedule/SchedulePage';
import TeacherCalendarPage from '@/features/teacher/calendar/CalendarPage';
import TeacherAttendancePage from '@/features/teacher/attendance/TeacherAttendancePage';
import TeacherAssignmentsPage from '@/features/teacher/assignments/AssignmentsPage';
import TeacherHomeworkPage from '@/features/teacher/homework/HomeworkPage';
import TeacherResourcesPage from '@/features/teacher/resources/ResourcesPage';
import TeacherOnlineClassesPage from '@/features/teacher/online-classes/OnlineClassesPage';
import TeacherPrivateLessonsPage from '@/features/teacher/private-lessons/PrivateLessonsPage';
import TeacherVipClassesPage from '@/features/teacher/vip-classes/VipClassesPage';
import TeacherAnnouncementsPage from '@/features/teacher/announcements/AnnouncementsPage';
import TeacherMessagesPage from '@/features/teacher/messages/MessagesPage';
import TeacherReportsPage from '@/features/teacher/reports/ReportsPage';
import TeacherRevenuePage from '@/features/teacher/revenue/RevenuePage';
import TeacherReviewsPage from '@/features/teacher/reviews/ReviewsPage';
import TeacherProfilePage from '@/features/teacher/profile/TeacherProfilePage';
import TeacherSettingsPage from '@/features/teacher/settings/TeacherSettingsPage';

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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'enroll', element: <EnrollPage /> },
      { path: 'schedule', element: <SchedulePageOld /> },
      { path: 'payments', element: <PaymentsPageOld /> },
      { path: 'invoices', element: <InvoicesPageOld /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'reviews', element: <StudentReviewsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
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
