import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { NavItem } from '@/components/layout/Sidebar';

function ParentFallback() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParentLayout() {
  const { lang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items: NavItem[] = [
    { label: t('nav.dashboard', lang), path: '/parent/dashboard', icon: 'LayoutDashboard' },
    { label: t('auth.register', lang), path: '/parent/enroll', icon: 'GraduationCap' },
    { label: t('nav.payments', lang), path: '/parent/payments', icon: 'DollarSign' },
    { label: t('nav.invoices', lang), path: '/parent/invoices', icon: 'FileText' },
    { label: t('nav.messages', lang), path: '/parent/messages', icon: 'MessageSquare' },
    { label: t('nav.profile', lang), path: '/parent/profile', icon: 'UserCircle' },
  ];
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={items} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Suspense fallback={<ParentFallback />}>
              <BackButton /><Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
