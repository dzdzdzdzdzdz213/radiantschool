import { createBrowserRouter } from 'react-router-dom';
import SafeRedirect from '@/components/SafeRedirect';

function lazyRoute(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  return () => importFn().then(m => ({ Component: m.default }));
}

const LandingPage = () => import('@/pages/LandingPage');
const LoginPage = () => import('@/pages/auth/LoginPage');
const RegisterPage = () => import('@/pages/auth/RegisterPage');
const ForgotPasswordPage = () => import('@/pages/auth/ForgotPasswordPage');
const ResetPasswordPage = () => import('@/pages/auth/ResetPasswordPage');
const DashboardPage = () => import('@/pages/DashboardPage');
const AdminDashboardPage = () => import('@/features/dashboard/AdminDashboardPage');
const AssistantDashboardPage = () => import('@/features/assistant/dashboard/AssistantDashboardPage');
const StudentsPage = () => import('@/features/assistant/students/StudentsPage');
const ParentsPage = () => import('@/features/assistant/parents/ParentsPage');
const RegistrationsPage = () => import('@/features/assistant/registrations/RegistrationsPage');
const AttendancePage = () => import('@/features/assistant/attendance/AttendancePage');
const RfidPage = () => import('@/features/assistant/rfid/RfidPage');
const GroupsPage = () => import('@/features/assistant/groups/GroupsPage');
const SchedulesPage = () => import('@/features/assistant/schedules/SchedulesPage');
const RoomsPage = () => import('@/features/assistant/rooms/RoomsPage');
const PaymentsPage = () => import('@/features/assistant/payments/PaymentsPage');
const InvoicesPage = () => import('@/features/assistant/invoices/InvoicesPage');
const NotificationsPage = () => import('@/features/assistant/notifications/NotificationsPage');
const EmailsPage = () => import('@/features/assistant/emails/EmailsPage');
const ResourcesPage = () => import('@/features/assistant/resources/ResourcesPage');
const CampaignsPage = () => import('@/features/assistant/campaigns/CampaignsPage');
const ReportsPage = () => import('@/features/assistant/reports/ReportsPage');
const CalendarPage = () => import('@/features/assistant/calendar/CalendarPage');
const SearchPage = () => import('@/features/assistant/search/SearchPage');
const AssistantSettingsPage = () => import('@/features/assistant/settings/SettingsPage');
const UsersPage = () => import('@/pages/admin/UsersPage');
const CoursesPage = () => import('@/pages/CoursesPage');
const CourseDetailPage = () => import('@/pages/CourseDetailPage');
const PaymentsPageOld = () => import('@/pages/PaymentsPage');
const InvoicesPageOld = () => import('@/pages/InvoicesPage');
const MessagesPage = () => import('@/pages/MessagesPage');
const SchedulePageOld = () => import('@/pages/SchedulePage');
const ProfilePage = () => import('@/pages/ProfilePage');
const TeacherEvaluationsPage = () => import('@/pages/TeacherEvaluationsPage');
const SettingsPage = () => import('@/pages/admin/SettingsPage');
const StudentDetailPage = () => import('@/pages/StudentDetailPage');
const LeaderboardPage = () => import('@/pages/LeaderboardPage');
const EnrollPage = () => import('@/pages/EnrollPage');
const TeacherDashboardPage = () => import('@/features/teacher/dashboard/TeacherDashboardPage');
const TeacherStudentsPage = () => import('@/features/teacher/students/TeacherStudentsPage');
const TeacherSchedulePage = () => import('@/features/teacher/schedule/SchedulePage');
const TeacherCalendarPage = () => import('@/features/teacher/calendar/CalendarPage');
const TeacherAttendancePage = () => import('@/features/teacher/attendance/TeacherAttendancePage');
const TeacherAssignmentsPage = () => import('@/features/teacher/assignments/AssignmentsPage');
const TeacherHomeworkPage = () => import('@/features/teacher/homework/HomeworkPage');
const TeacherResourcesPage = () => import('@/features/teacher/resources/ResourcesPage');
const TeacherOnlineClassesPage = () => import('@/features/teacher/online-classes/OnlineClassesPage');
const TeacherPrivateLessonsPage = () => import('@/features/teacher/private-lessons/PrivateLessonsPage');
const TeacherVipClassesPage = () => import('@/features/teacher/vip-classes/VipClassesPage');
const TeacherAnnouncementsPage = () => import('@/features/teacher/announcements/AnnouncementsPage');
const TeacherMessagesPage = () => import('@/features/teacher/messages/MessagesPage');
const TeacherReportsPage = () => import('@/features/teacher/reports/ReportsPage');
const TeacherRevenuePage = () => import('@/features/teacher/revenue/RevenuePage');
const TeacherReviewsPage = () => import('@/features/teacher/reviews/ReviewsPage');
const TeacherProfilePage = () => import('@/features/teacher/profile/TeacherProfilePage');
const TeacherSettingsPage = () => import('@/features/teacher/settings/TeacherSettingsPage');
const StudentDashboardPage = () => import('@/features/student/dashboard/StudentDashboardPage');
const StudentCoursesPage = () => import('@/features/student/courses/StudentCoursesPage');
const StudentSchedulePage = () => import('@/features/student/schedule/StudentSchedulePage');
const StudentCalendarPage = () => import('@/features/student/calendar/StudentCalendarPage');
const StudentAttendancePage = () => import('@/features/student/attendance/StudentAttendancePage');
const StudentHomeworkPage = () => import('@/features/student/homework/StudentHomeworkPage');
const StudentResourcesPage = () => import('@/features/student/resources/StudentResourcesPage');
const StudentOnlineClassesPage = () => import('@/features/student/online-classes/StudentOnlineClassesPage');
const StudentPrivateLessonsPage = () => import('@/features/student/private-lessons/StudentPrivateLessonsPage');
const StudentVipClassesPage = () => import('@/features/student/vip-classes/StudentVipClassesPage');
const StudentPaymentsPage = () => import('@/features/student/payments/StudentPaymentsPage');
const StudentInvoicesPage = () => import('@/features/student/invoices/StudentInvoicesPage');
const StudentCertificatesPage = () => import('@/features/student/certificates/StudentCertificatesPage');
const StudentAnnouncementsPage = () => import('@/features/student/announcements/StudentAnnouncementsPage');
const StudentMessagesPage = () => import('@/features/student/messages/StudentMessagesPage');
const StudentNotificationsPage = () => import('@/features/student/notifications/StudentNotificationsPage');
const StudentReviewsPage = () => import('@/features/student/reviews/StudentReviewsPage');
const StudentProfilePage = () => import('@/features/student/profile/StudentProfilePage');
const StudentSettingsPage = () => import('@/features/student/settings/StudentSettingsPage');

export const router = createBrowserRouter([
  {
    path: '/login/:role?',
    lazy: lazyRoute(LoginPage),
  },
  {
    path: '/register',
    lazy: lazyRoute(RegisterPage),
  },
  {
    path: '/forgot-password',
    lazy: lazyRoute(ForgotPasswordPage),
  },
  {
    path: '/reset-password',
    lazy: lazyRoute(ResetPasswordPage),
  },
  {
    path: '/admin',
    lazy: lazyRoute(() => import('@/routes/AdminRoute')),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', lazy: lazyRoute(AdminDashboardPage) },
      { path: 'users', lazy: lazyRoute(UsersPage) },
      { path: 'users/:id', lazy: lazyRoute(StudentDetailPage) },
      { path: 'courses', lazy: lazyRoute(CoursesPage) },
      { path: 'courses/:id', lazy: lazyRoute(CourseDetailPage) },
      { path: 'attendance', lazy: lazyRoute(AttendancePage) },
      { path: 'payments', lazy: lazyRoute(PaymentsPage) },
      { path: 'invoices', lazy: lazyRoute(InvoicesPage) },
      { path: 'reports', lazy: lazyRoute(ReportsPage) },
      { path: 'messages', lazy: lazyRoute(MessagesPage) },
      { path: 'schedule', lazy: lazyRoute(SchedulePageOld) },
      { path: 'profile', lazy: lazyRoute(ProfilePage) },
      { path: 'settings', lazy: lazyRoute(SettingsPage) },
    ],
  },
  {
    path: '/assistant',
    lazy: lazyRoute(() => import('@/routes/AssistantRoute')),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', lazy: lazyRoute(AssistantDashboardPage) },
      { path: 'students', lazy: lazyRoute(StudentsPage) },
      { path: 'students/new', lazy: lazyRoute(StudentsPage) },
      { path: 'students/:id', lazy: lazyRoute(StudentDetailPage) },
      { path: 'parents', lazy: lazyRoute(ParentsPage) },
      { path: 'parents/new', lazy: lazyRoute(ParentsPage) },
      { path: 'parents/:id', lazy: lazyRoute(StudentDetailPage) },
      { path: 'registrations', lazy: lazyRoute(RegistrationsPage) },
      { path: 'attendance', lazy: lazyRoute(AttendancePage) },
      { path: 'rfid', lazy: lazyRoute(RfidPage) },
      { path: 'groups', lazy: lazyRoute(GroupsPage) },
      { path: 'schedules', lazy: lazyRoute(SchedulesPage) },
      { path: 'rooms', lazy: lazyRoute(RoomsPage) },
      { path: 'payments', lazy: lazyRoute(PaymentsPage) },
      { path: 'payments/new', lazy: lazyRoute(PaymentsPage) },
      { path: 'invoices', lazy: lazyRoute(InvoicesPage) },
      { path: 'invoices/new', lazy: lazyRoute(InvoicesPage) },
      { path: 'notifications', lazy: lazyRoute(NotificationsPage) },
      { path: 'emails', lazy: lazyRoute(EmailsPage) },
      { path: 'resources', lazy: lazyRoute(ResourcesPage) },
      { path: 'campaigns', lazy: lazyRoute(CampaignsPage) },
      { path: 'reports', lazy: lazyRoute(ReportsPage) },
      { path: 'calendar', lazy: lazyRoute(CalendarPage) },
      { path: 'search', lazy: lazyRoute(SearchPage) },
      { path: 'settings', lazy: lazyRoute(AssistantSettingsPage) },
      { path: 'profile', lazy: lazyRoute(ProfilePage) },
      { path: 'courses', lazy: lazyRoute(CoursesPage) },
      { path: 'courses/:id', lazy: lazyRoute(CourseDetailPage) },
      { path: 'messages', lazy: lazyRoute(MessagesPage) },
    ],
  },
  {
    path: '/teacher',
    lazy: lazyRoute(() => import('@/routes/TeacherRoute')),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', lazy: lazyRoute(TeacherDashboardPage) },
      { path: 'students', lazy: lazyRoute(TeacherStudentsPage) },
      { path: 'students/:id', lazy: lazyRoute(StudentDetailPage) },
      { path: 'courses', lazy: lazyRoute(CoursesPage) },
      { path: 'courses/:id', lazy: lazyRoute(CourseDetailPage) },
      { path: 'attendance', lazy: lazyRoute(TeacherAttendancePage) },
      { path: 'schedule', lazy: lazyRoute(TeacherSchedulePage) },
      { path: 'calendar', lazy: lazyRoute(TeacherCalendarPage) },
      { path: 'assignments', lazy: lazyRoute(TeacherAssignmentsPage) },
      { path: 'homework', lazy: lazyRoute(TeacherHomeworkPage) },
      { path: 'resources', lazy: lazyRoute(TeacherResourcesPage) },
      { path: 'online-classes', lazy: lazyRoute(TeacherOnlineClassesPage) },
      { path: 'private-lessons', lazy: lazyRoute(TeacherPrivateLessonsPage) },
      { path: 'vip-classes', lazy: lazyRoute(TeacherVipClassesPage) },
      { path: 'announcements', lazy: lazyRoute(TeacherAnnouncementsPage) },
      { path: 'messages', lazy: lazyRoute(TeacherMessagesPage) },
      { path: 'reports', lazy: lazyRoute(TeacherReportsPage) },
      { path: 'revenue', lazy: lazyRoute(TeacherRevenuePage) },
      { path: 'reviews', lazy: lazyRoute(TeacherReviewsPage) },
      { path: 'evaluations', lazy: lazyRoute(TeacherEvaluationsPage) },
      { path: 'leaderboard', lazy: lazyRoute(LeaderboardPage) },
      { path: 'profile', lazy: lazyRoute(TeacherProfilePage) },
      { path: 'settings', lazy: lazyRoute(TeacherSettingsPage) },
    ],
  },
  {
    path: '/student',
    lazy: lazyRoute(() => import('@/routes/StudentRoute')),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', lazy: lazyRoute(StudentDashboardPage) },
      { path: 'courses', lazy: lazyRoute(StudentCoursesPage) },
      { path: 'courses/:id', lazy: lazyRoute(CourseDetailPage) },
      { path: 'enroll', lazy: lazyRoute(EnrollPage) },
      { path: 'schedule', lazy: lazyRoute(StudentSchedulePage) },
      { path: 'calendar', lazy: lazyRoute(StudentCalendarPage) },
      { path: 'attendance', lazy: lazyRoute(StudentAttendancePage) },
      { path: 'homework', lazy: lazyRoute(StudentHomeworkPage) },
      { path: 'resources', lazy: lazyRoute(StudentResourcesPage) },
      { path: 'online-classes', lazy: lazyRoute(StudentOnlineClassesPage) },
      { path: 'private-lessons', lazy: lazyRoute(StudentPrivateLessonsPage) },
      { path: 'vip-classes', lazy: lazyRoute(StudentVipClassesPage) },
      { path: 'payments', lazy: lazyRoute(StudentPaymentsPage) },
      { path: 'invoices', lazy: lazyRoute(StudentInvoicesPage) },
      { path: 'certificates', lazy: lazyRoute(StudentCertificatesPage) },
      { path: 'announcements', lazy: lazyRoute(StudentAnnouncementsPage) },
      { path: 'messages', lazy: lazyRoute(StudentMessagesPage) },
      { path: 'notifications', lazy: lazyRoute(StudentNotificationsPage) },
      { path: 'reviews', lazy: lazyRoute(StudentReviewsPage) },
      { path: 'leaderboard', lazy: lazyRoute(LeaderboardPage) },
      { path: 'profile', lazy: lazyRoute(StudentProfilePage) },
      { path: 'settings', lazy: lazyRoute(StudentSettingsPage) },
    ],
  },
  {
    path: '/parent',
    lazy: lazyRoute(() => import('@/routes/ParentRoute')),
    children: [
      { index: true, element: <SafeRedirect to="dashboard" /> },
      { path: 'dashboard', lazy: lazyRoute(DashboardPage) },
      { path: 'children', lazy: lazyRoute(CoursesPage) },
      { path: 'children/:id', lazy: lazyRoute(StudentDetailPage) },
      { path: 'enroll', lazy: lazyRoute(EnrollPage) },
      { path: 'payments', lazy: lazyRoute(PaymentsPageOld) },
      { path: 'invoices', lazy: lazyRoute(InvoicesPageOld) },
      { path: 'schedule', lazy: lazyRoute(SchedulePageOld) },
      { path: 'messages', lazy: lazyRoute(MessagesPage) },
      { path: 'profile', lazy: lazyRoute(ProfilePage) },
    ],
  },
  {
    path: '/leaderboard',
    lazy: lazyRoute(LeaderboardPage),
  },
  {
    path: '/',
    lazy: lazyRoute(LandingPage),
  },
  {
    path: '*',
    element: <SafeRedirect to="/login" />,
  },
]);
