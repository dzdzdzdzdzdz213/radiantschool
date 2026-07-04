import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SafeRedirect from '@/components/SafeRedirect';
import AdminRoute from '@/routes/AdminRoute';
import AssistantRoute from '@/routes/AssistantRoute';
import TeacherRoute from '@/routes/TeacherRoute';
import StudentRoute from '@/routes/StudentRoute';
import ParentRoute from '@/routes/ParentRoute';

import SchedulePage from '@/pages/SchedulePage';


import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import AdminDashboardPage from '@/features/dashboard/AdminDashboardPage';
import AssistantDashboardPage from '@/features/assistant/dashboard/AssistantDashboardPage';
import ParentDashboardPage from '@/features/parent/dashboard/ParentDashboardPage';
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
import PaymentsPageOld from '@/pages/PaymentsPage';
import InvoicesPageOld from '@/pages/InvoicesPage';
import MessagesPage from '@/pages/MessagesPage';
import ProfilePage from '@/pages/ProfilePage';
import TeacherEvaluationsPage from '@/pages/TeacherEvaluationsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
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
import StudentDashboardPage from '@/features/student/dashboard/StudentDashboardPage';
import StudentCoursesPage from '@/features/student/courses/StudentCoursesPage';
import StudentSchedulePage from '@/features/student/schedule/StudentSchedulePage';
import StudentCalendarPage from '@/features/student/calendar/StudentCalendarPage';
import StudentAttendancePage from '@/features/student/attendance/StudentAttendancePage';
import StudentHomeworkPage from '@/features/student/homework/StudentHomeworkPage';
import StudentResourcesPage from '@/features/student/resources/StudentResourcesPage';
import StudentOnlineClassesPage from '@/features/student/online-classes/StudentOnlineClassesPage';
import StudentPrivateLessonsPage from '@/features/student/private-lessons/StudentPrivateLessonsPage';
import StudentVipClassesPage from '@/features/student/vip-classes/StudentVipClassesPage';
import StudentPaymentsPage from '@/features/student/payments/StudentPaymentsPage';
import StudentInvoicesPage from '@/features/student/invoices/StudentInvoicesPage';
import StudentCertificatesPage from '@/features/student/certificates/StudentCertificatesPage';
import StudentAnnouncementsPage from '@/features/student/announcements/StudentAnnouncementsPage';
import StudentMessagesPage from '@/features/student/messages/StudentMessagesPage';
import StudentNotificationsPage from '@/features/student/notifications/StudentNotificationsPage';
import StudentReviewsPage from '@/features/student/reviews/StudentReviewsPage';
import StudentProfilePage from '@/features/student/profile/StudentProfilePage';
import StudentSettingsPage from '@/features/student/settings/StudentSettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login/:role?',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
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
    path: '/admin',
    Component: AdminRoute,
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: AdminDashboardPage },
      { path: 'users', Component: UsersPage },
      { path: 'users/:id', Component: StudentDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'attendance', Component: AttendancePage },
      { path: 'payments', Component: PaymentsPage },
      { path: 'invoices', Component: InvoicesPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'schedule', Component: SchedulePage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
  {
    path: '/assistant',
    Component: AssistantRoute,
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
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'messages', Component: MessagesPage },
    ],
  },
  {
    path: '/teacher',
    Component: TeacherRoute,
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: TeacherDashboardPage },
      { path: 'students', Component: TeacherStudentsPage },
      { path: 'students/:id', Component: StudentDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'attendance', Component: TeacherAttendancePage },
      { path: 'schedule', Component: TeacherSchedulePage },
      { path: 'calendar', Component: TeacherCalendarPage },
      { path: 'assignments', Component: TeacherAssignmentsPage },
      { path: 'homework', Component: TeacherHomeworkPage },
      { path: 'resources', Component: TeacherResourcesPage },
      { path: 'online-classes', Component: TeacherOnlineClassesPage },
      { path: 'private-lessons', Component: TeacherPrivateLessonsPage },
      { path: 'vip-classes', Component: TeacherVipClassesPage },
      { path: 'announcements', Component: TeacherAnnouncementsPage },
      { path: 'messages', Component: TeacherMessagesPage },
      { path: 'reports', Component: TeacherReportsPage },
      { path: 'revenue', Component: TeacherRevenuePage },
      { path: 'reviews', Component: TeacherReviewsPage },
      { path: 'evaluations', Component: TeacherEvaluationsPage },
      { path: 'leaderboard', Component: LeaderboardPage },
      { path: 'profile', Component: TeacherProfilePage },
      { path: 'settings', Component: TeacherSettingsPage },
    ],
  },
  {
    path: '/student',
    Component: StudentRoute,
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: StudentDashboardPage },
      { path: 'courses', Component: StudentCoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'enroll', Component: EnrollPage },
      { path: 'schedule', Component: StudentSchedulePage },
      { path: 'calendar', Component: StudentCalendarPage },
      { path: 'attendance', Component: StudentAttendancePage },
      { path: 'homework', Component: StudentHomeworkPage },
      { path: 'resources', Component: StudentResourcesPage },
      { path: 'online-classes', Component: StudentOnlineClassesPage },
      { path: 'private-lessons', Component: StudentPrivateLessonsPage },
      { path: 'vip-classes', Component: StudentVipClassesPage },
      { path: 'payments', Component: StudentPaymentsPage },
      { path: 'invoices', Component: StudentInvoicesPage },
      { path: 'certificates', Component: StudentCertificatesPage },
      { path: 'announcements', Component: StudentAnnouncementsPage },
      { path: 'messages', Component: StudentMessagesPage },
      { path: 'notifications', Component: StudentNotificationsPage },
      { path: 'reviews', Component: StudentReviewsPage },
      { path: 'leaderboard', Component: LeaderboardPage },
      { path: 'profile', Component: StudentProfilePage },
      { path: 'settings', Component: StudentSettingsPage },
    ],
  },
  {
    path: '/parent',
    Component: ParentRoute,
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', Component: ParentDashboardPage },
      { path: 'children', Component: CoursesPage },
      { path: 'children/:id', Component: StudentDetailPage },
      { path: 'enroll', Component: EnrollPage },
      { path: 'payments', Component: PaymentsPageOld },
      { path: 'invoices', Component: InvoicesPageOld },
      { path: 'schedule', Component: SchedulePage },
      { path: 'messages', Component: MessagesPage },
      { path: 'profile', Component: ProfilePage },
    ],
  },
  {
    path: '/leaderboard',
    element: <ProtectedRoute allowedRoles={['admin','teacher','student','parent','assistant']}><LeaderboardPage /></ProtectedRoute>,
  },
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '*',
    element: <SafeRedirect to="/login" />,
  },
]);
