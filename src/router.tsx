import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SafeRedirect from '@/components/SafeRedirect';
import StudentRoute from '@/routes/StudentRoute';
import ParentRoute from '@/routes/ParentRoute';
import LoginPage from '@/pages/auth/LoginPage';
import LandingPage from '@/pages/LandingPage';
import PublicCoursesPage from '@/pages/PublicCoursesPage';
import PrivateRequestPage from '@/pages/PrivateRequestPage';
import LegalPage from '@/pages/LegalPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import PublicEnrollPage from '@/pages/auth/PublicEnrollPage';

import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import CompleteProfilePage from '@/pages/auth/CompleteProfilePage';

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
const TeacherRoute = lazy(() => import('@/routes/TeacherRoute'));

const AdminDashboardPage = LazyPage(() => import('@/features/dashboard/AdminDashboardPage'));
const AssistantDashboardPage = LazyPage(() => import('@/features/assistant/dashboard/AssistantDashboardPage'));
const ParentDashboardPage = LazyPage(() => import('@/features/parent/dashboard/ParentDashboardPage'));
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
const PaymentsPageOld = LazyPage(() => import('@/pages/PaymentsPage'));
const InvoicesPageOld = LazyPage(() => import('@/pages/InvoicesPage'));
const MessagesPage = LazyPage(() => import('@/pages/MessagesPage'));
const ProfilePage = LazyPage(() => import('@/pages/ProfilePage'));
const HelpPage = LazyPage(() => import('@/pages/HelpPage'));
const TeacherEvaluationsPage = LazyPage(() => import('@/pages/TeacherEvaluationsPage'));
const SettingsPage = LazyPage(() => import('@/pages/admin/SettingsPage'));
const StudentDetailPage = LazyPage(() => import('@/pages/StudentDetailPage'));
const LeaderboardPage = LazyPage(() => import('@/pages/LeaderboardPage'));
const NotFoundPage = LazyPage(() => import('@/pages/NotFoundPage'));
const PublicFaqPage = LazyPage(() => import('@/pages/PublicFaqPage'));
const PublicContactPage = LazyPage(() => import('@/pages/PublicContactPage'));
const EnrollPage = LazyPage(() => import('@/pages/EnrollPage'));
const PrimaryPage = LazyPage(() => import('@/pages/formations/PrimaryPage'));
const MiddleSchoolPage = LazyPage(() => import('@/pages/formations/MiddleSchoolPage'));
const HighSchoolPage = LazyPage(() => import('@/pages/formations/HighSchoolPage'));
const TeachersPage = LazyPage(() => import('@/pages/formations/TeachersPage'));
const FormationTeacherProfilePage = LazyPage(() => import('@/pages/formations/TeacherProfilePage'));
const TeacherDashboardPage = LazyPage(() => import('@/features/teacher/dashboard/TeacherDashboardPage'));
const TeacherStudentsPage = LazyPage(() => import('@/features/teacher/students/TeacherStudentsPage'));
const TeacherSchedulePage = LazyPage(() => import('@/features/teacher/schedule/SchedulePage'));
const TeacherCalendarPage = LazyPage(() => import('@/features/teacher/calendar/CalendarPage'));
const TeacherAttendancePage = LazyPage(() => import('@/features/teacher/attendance/TeacherAttendancePage'));
const TeacherAssignmentsPage = LazyPage(() => import('@/features/teacher/assignments/AssignmentsPage'));
const TeacherHomeworkPage = LazyPage(() => import('@/features/teacher/homework/HomeworkPage'));
const TeacherResourcesPage = LazyPage(() => import('@/features/teacher/resources/ResourcesPage'));
const TeacherOnlineClassesPage = LazyPage(() => import('@/features/teacher/online-classes/OnlineClassesPage'));
const TeacherPrivateLessonsPage = LazyPage(() => import('@/features/teacher/private-lessons/PrivateLessonsPage'));
const TeacherVipClassesPage = LazyPage(() => import('@/features/teacher/vip-classes/VipClassesPage'));
const TeacherAnnouncementsPage = LazyPage(() => import('@/features/teacher/announcements/AnnouncementsPage'));
const TeacherMessagesPage = LazyPage(() => import('@/features/teacher/messages/MessagesPage'));
const TeacherReportsPage = LazyPage(() => import('@/features/teacher/reports/ReportsPage'));
const TeacherRevenuePage = LazyPage(() => import('@/features/teacher/revenue/RevenuePage'));
const TeacherReviewsPage = LazyPage(() => import('@/features/teacher/reviews/ReviewsPage'));
const TeacherProfilePage = LazyPage(() => import('@/features/teacher/profile/TeacherProfilePage'));
const TeacherSettingsPage = LazyPage(() => import('@/features/teacher/settings/TeacherSettingsPage'));
const StudentDashboardPage = LazyPage(() => import('@/features/student/dashboard/StudentDashboardPage'));
const StudentCoursesPage = LazyPage(() => import('@/features/student/courses/StudentCoursesPage'));
const StudentSchedulePage = LazyPage(() => import('@/features/student/schedule/StudentSchedulePage'));
const StudentCalendarPage = LazyPage(() => import('@/features/student/calendar/StudentCalendarPage'));
const StudentAttendancePage = LazyPage(() => import('@/features/student/attendance/StudentAttendancePage'));
const StudentHomeworkPage = LazyPage(() => import('@/features/student/homework/StudentHomeworkPage'));
const StudentResourcesPage = LazyPage(() => import('@/features/student/resources/StudentResourcesPage'));
const StudentOnlineClassesPage = LazyPage(() => import('@/features/student/online-classes/StudentOnlineClassesPage'));
const StudentPrivateLessonsPage = LazyPage(() => import('@/features/student/private-lessons/StudentPrivateLessonsPage'));
const StudentVipClassesPage = LazyPage(() => import('@/features/student/vip-classes/StudentVipClassesPage'));
const StudentPaymentsPage = LazyPage(() => import('@/features/student/payments/StudentPaymentsPage'));
const StudentInvoicesPage = LazyPage(() => import('@/features/student/invoices/StudentInvoicesPage'));
const StudentCertificatesPage = LazyPage(() => import('@/features/student/certificates/StudentCertificatesPage'));
const StudentAnnouncementsPage = LazyPage(() => import('@/features/student/announcements/StudentAnnouncementsPage'));
const StudentMessagesPage = LazyPage(() => import('@/features/student/messages/StudentMessagesPage'));
const StudentNotificationsPage = LazyPage(() => import('@/features/student/notifications/StudentNotificationsPage'));
const StudentReviewsPage = LazyPage(() => import('@/features/student/reviews/StudentReviewsPage'));
const StudentProfilePage = LazyPage(() => import('@/features/student/profile/StudentProfilePage'));
const StudentSettingsPage = LazyPage(() => import('@/features/student/settings/StudentSettingsPage'));
const SchedulePage = LazyPage(() => import('@/pages/SchedulePage'));
const StaffLoginPage = LazyPage(() => import('@/pages/auth/StaffLoginPage'));

export const router = createBrowserRouter([
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
    path: '/teacher',
    Component: () => (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <TeacherRoute />
      </Suspense>
    ),
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
      { path: 'help', Component: HelpPage },
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
      { path: 'help', Component: HelpPage },
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
      { path: 'notifications', element: <SafeRedirect to="/parent/dashboard" /> },
      { path: 'profile', Component: ProfilePage },
      { path: 'help', Component: HelpPage },
    ],
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
    Component: FormationTeacherProfilePage,
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
    path: '/:page',
    element: <LegalPage />,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
