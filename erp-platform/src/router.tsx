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
import UsersPage from '@/pages/admin/UsersPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import AttendancePage from '@/pages/AttendancePage';
import PaymentsPage from '@/pages/PaymentsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import ReportsPage from '@/pages/ReportsPage';
import MessagesPage from '@/pages/MessagesPage';
import SchedulePage from '@/pages/SchedulePage';
import ProfilePage from '@/pages/ProfilePage';
import TeacherEvaluationsPage from '@/pages/TeacherEvaluationsPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import StudentDetailPage from '@/pages/StudentDetailPage';
import StudentReviewsPage from '@/pages/student/StudentReviewsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import EnrollPage from '@/pages/EnrollPage';

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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:id', element: <StudentDetailPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'profile', element: <ProfilePage /> },
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'evaluations', element: <TeacherEvaluationsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
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
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
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
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'schedule', element: <SchedulePage /> },
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
