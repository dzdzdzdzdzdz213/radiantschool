import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentLayout from '@/layouts/StudentLayout';
import ParentLayout from '@/layouts/ParentLayout';
import TeacherLayout from '@/layouts/TeacherLayout';

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
const ParentDashboardPage = lazy(() => import('@/pages/parent/ParentDashboardPage'));
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'));

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
    path: '/:page',
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
    ],
  },
];

export const router = createBrowserRouter([
  ...websiteRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...teacherRoutes,
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
