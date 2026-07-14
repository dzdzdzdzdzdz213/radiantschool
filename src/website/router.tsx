import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

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

export const router = createBrowserRouter([
  ...websiteRoutes,
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
