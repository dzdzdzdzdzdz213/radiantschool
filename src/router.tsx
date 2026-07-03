import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader } from 'lucide-react';
import SafeRedirect from '@/components/SafeRedirect';
import AdminRoute from '@/routes/AdminRoute';
import AssistantRoute from '@/routes/AssistantRoute';
import TeacherRoute from '@/routes/TeacherRoute';
import StudentRoute from '@/routes/StudentRoute';
import ParentRoute from '@/routes/ParentRoute';

import SchedulePage from '@/pages/SchedulePage';

function FullPageLoader() {
  return <div className="flex h-screen items-center justify-center"><Loader className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
}

function createLazyComponent(importer: () => Promise<{ default: React.ComponentType<any> }>) {
  const LazyComp = React.lazy(importer);
  const Component = function LazyPage() {
    return (
      <Suspense fallback={<FullPageLoader />}>
        <LazyComp />
      </Suspense>
    );
  };
  Component.displayName = 'LazyPage';
  return Component;
}

const LandingPage = createLazyComponent(() => import('@/pages/LandingPage'));
const LoginPage = createLazyComponent(() => import('@/pages/auth/LoginPage'));
const RegisterPage = createLazyComponent(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = createLazyComponent(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = createLazyComponent(() => import('@/pages/auth/ResetPasswordPage'));
const DashboardPage = createLazyComponent(() => import('@/pages/DashboardPage'));
const AdminDashboardPage = createLazyComponent(() => import('@/features/dashboard/AdminDashboardPage'));
const AssistantDashboardPage = createLazyComponent(() => import('@/features/assistant/dashboard/AssistantDashboardPage'));
const StudentsPage = createLazyComponent(() => import('@/features/assistant/students/StudentsPage'));
const ParentsPage = createLazyComponent(() => import('@/features/assistant/parents/ParentsPage'));
const RegistrationsPage = createLazyComponent(() => import('@/features/assistant/registrations/RegistrationsPage'));
const AttendancePage = createLazyComponent(() => import('@/features/assistant/attendance/AttendancePage'));
const RfidPage = createLazyComponent(() => import('@/features/assistant/rfid/RfidPage'));
const GroupsPage = createLazyComponent(() => import('@/features/assistant/groups/GroupsPage'));
const SchedulesPage = createLazyComponent(() => import('@/features/assistant/schedules/SchedulesPage'));
const RoomsPage = createLazyComponent(() => import('@/features/assistant/rooms/RoomsPage'));
const PaymentsPage = createLazyComponent(() => import('@/features/assistant/payments/PaymentsPage'));
const InvoicesPage = createLazyComponent(() => import('@/features/assistant/invoices/InvoicesPage'));
const NotificationsPage = createLazyComponent(() => import('@/features/assistant/notifications/NotificationsPage'));
const EmailsPage = createLazyComponent(() => import('@/features/assistant/emails/EmailsPage'));
const ResourcesPage = createLazyComponent(() => import('@/features/assistant/resources/ResourcesPage'));
const CampaignsPage = createLazyComponent(() => import('@/features/assistant/campaigns/CampaignsPage'));
const ReportsPage = createLazyComponent(() => import('@/features/assistant/reports/ReportsPage'));
const CalendarPage = createLazyComponent(() => import('@/features/assistant/calendar/CalendarPage'));
const SearchPage = createLazyComponent(() => import('@/features/assistant/search/SearchPage'));
const AssistantSettingsPage = createLazyComponent(() => import('@/features/assistant/settings/SettingsPage'));
const UsersPage = createLazyComponent(() => import('@/pages/admin/UsersPage'));
const CoursesPage = createLazyComponent(() => import('@/pages/CoursesPage'));
const CourseDetailPage = createLazyComponent(() => import('@/pages/CourseDetailPage'));
const PaymentsPageOld = createLazyComponent(() => import('@/pages/PaymentsPage'));
const InvoicesPageOld = createLazyComponent(() => import('@/pages/InvoicesPage'));
const MessagesPage = createLazyComponent(() => import('@/pages/MessagesPage'));
const ProfilePage = createLazyComponent(() => import('@/pages/ProfilePage'));
const TeacherEvaluationsPage = createLazyComponent(() => import('@/pages/TeacherEvaluationsPage'));
const SettingsPage = createLazyComponent(() => import('@/pages/admin/SettingsPage'));
const StudentDetailPage = createLazyComponent(() => import('@/pages/StudentDetailPage'));
const LeaderboardPage = createLazyComponent(() => import('@/pages/LeaderboardPage'));
const EnrollPage = createLazyComponent(() => import('@/pages/EnrollPage'));
const TeacherDashboardPage = createLazyComponent(() => import('@/features/teacher/dashboard/TeacherDashboardPage'));
const TeacherStudentsPage = createLazyComponent(() => import('@/features/teacher/students/TeacherStudentsPage'));
const TeacherSchedulePage = createLazyComponent(() => import('@/features/teacher/schedule/SchedulePage'));
const TeacherCalendarPage = createLazyComponent(() => import('@/features/teacher/calendar/CalendarPage'));
const TeacherAttendancePage = createLazyComponent(() => import('@/features/teacher/attendance/TeacherAttendancePage'));
const TeacherAssignmentsPage = createLazyComponent(() => import('@/features/teacher/assignments/AssignmentsPage'));
const TeacherHomeworkPage = createLazyComponent(() => import('@/features/teacher/homework/HomeworkPage'));
const TeacherResourcesPage = createLazyComponent(() => import('@/features/teacher/resources/ResourcesPage'));
const TeacherOnlineClassesPage = createLazyComponent(() => import('@/features/teacher/online-classes/OnlineClassesPage'));
const TeacherPrivateLessonsPage = createLazyComponent(() => import('@/features/teacher/private-lessons/PrivateLessonsPage'));
const TeacherVipClassesPage = createLazyComponent(() => import('@/features/teacher/vip-classes/VipClassesPage'));
const TeacherAnnouncementsPage = createLazyComponent(() => import('@/features/teacher/announcements/AnnouncementsPage'));
const TeacherMessagesPage = createLazyComponent(() => import('@/features/teacher/messages/MessagesPage'));
const TeacherReportsPage = createLazyComponent(() => import('@/features/teacher/reports/ReportsPage'));
const TeacherRevenuePage = createLazyComponent(() => import('@/features/teacher/revenue/RevenuePage'));
const TeacherReviewsPage = createLazyComponent(() => import('@/features/teacher/reviews/ReviewsPage'));
const TeacherProfilePage = createLazyComponent(() => import('@/features/teacher/profile/TeacherProfilePage'));
const TeacherSettingsPage = createLazyComponent(() => import('@/features/teacher/settings/TeacherSettingsPage'));
const StudentDashboardPage = createLazyComponent(() => import('@/features/student/dashboard/StudentDashboardPage'));
const StudentCoursesPage = createLazyComponent(() => import('@/features/student/courses/StudentCoursesPage'));
const StudentSchedulePage = createLazyComponent(() => import('@/features/student/schedule/StudentSchedulePage'));
const StudentCalendarPage = createLazyComponent(() => import('@/features/student/calendar/StudentCalendarPage'));
const StudentAttendancePage = createLazyComponent(() => import('@/features/student/attendance/StudentAttendancePage'));
const StudentHomeworkPage = createLazyComponent(() => import('@/features/student/homework/StudentHomeworkPage'));
const StudentResourcesPage = createLazyComponent(() => import('@/features/student/resources/StudentResourcesPage'));
const StudentOnlineClassesPage = createLazyComponent(() => import('@/features/student/online-classes/StudentOnlineClassesPage'));
const StudentPrivateLessonsPage = createLazyComponent(() => import('@/features/student/private-lessons/StudentPrivateLessonsPage'));
const StudentVipClassesPage = createLazyComponent(() => import('@/features/student/vip-classes/StudentVipClassesPage'));
const StudentPaymentsPage = createLazyComponent(() => import('@/features/student/payments/StudentPaymentsPage'));
const StudentInvoicesPage = createLazyComponent(() => import('@/features/student/invoices/StudentInvoicesPage'));
const StudentCertificatesPage = createLazyComponent(() => import('@/features/student/certificates/StudentCertificatesPage'));
const StudentAnnouncementsPage = createLazyComponent(() => import('@/features/student/announcements/StudentAnnouncementsPage'));
const StudentMessagesPage = createLazyComponent(() => import('@/features/student/messages/StudentMessagesPage'));
const StudentNotificationsPage = createLazyComponent(() => import('@/features/student/notifications/StudentNotificationsPage'));
const StudentReviewsPage = createLazyComponent(() => import('@/features/student/reviews/StudentReviewsPage'));
const StudentProfilePage = createLazyComponent(() => import('@/features/student/profile/StudentProfilePage'));
const StudentSettingsPage = createLazyComponent(() => import('@/features/student/settings/StudentSettingsPage'));

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
      { path: 'dashboard', Component: DashboardPage },
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
    Component: LeaderboardPage,
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
