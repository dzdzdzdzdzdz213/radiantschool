import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import BackButton from '@/components/ui/BackButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { NavItem } from '@/components/layout/AdminSidebar';

function DashboardFallback() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-border bg-card p-8"><div className="flex items-center gap-4"><Skeleton className="h-14 w-14 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-40" /></div></div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-16" /></div>))}</div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[340px] rounded-2xl" /><Skeleton className="h-[340px] rounded-2xl" /></div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-500">{children}</div>;
}

export default function StudentLayout() {
  const { lang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const studentNavItems: NavItem[] = [
    { label: t('nav.dashboard', lang), path: '/student/dashboard', icon: 'LayoutDashboard' },
    { label: t('nav.my_courses', lang), path: '/student/courses', icon: 'BookOpen' },
    { label: t('nav.schedule', lang), path: '/student/schedule', icon: 'Calendar' },
    { label: t('nav.calendar', lang), path: '/student/calendar', icon: 'Calendar' },
    { label: t('nav.attendance', lang), path: '/student/attendance', icon: 'ClipboardCheck' },
    { label: t('nav.homework', lang), path: '/student/homework', icon: 'FileText' },
    { label: t('nav.resources', lang), path: '/student/resources', icon: 'GraduationCap' },
    { label: t('nav.online_classes', lang), path: '/student/online-classes', icon: 'Video' },
    { label: t('nav.private_lessons', lang), path: '/student/private-lessons', icon: 'UserPlus' },
    { label: t('nav.vip_classes', lang), path: '/student/vip-classes', icon: 'Star' },
    { label: t('nav.payments', lang), path: '/student/payments', icon: 'DollarSign' },
    { label: t('nav.invoices', lang), path: '/student/invoices', icon: 'FileText' },
    { label: t('nav.certificates', lang), path: '/student/certificates', icon: 'Award' },
    { label: t('nav.announcements', lang), path: '/student/announcements', icon: 'Megaphone' },
    { label: t('nav.messages', lang), path: '/student/messages', icon: 'MessageSquare' },
    { label: t('nav.reviews', lang), path: '/student/reviews', icon: 'Star' },
    { label: t('nav.notifications', lang), path: '/student/notifications', icon: 'Bell' },
    { label: t('nav.profile', lang), path: '/student/profile', icon: 'UserCircle' },
    { label: t('nav.settings', lang), path: '/student/settings', icon: 'Settings' },
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('student_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('student_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        items={studentNavItems}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-4"><BackButton label={t('common.back_to_site', lang)} to="/" /></div>
            <ErrorBoundary>
              <Suspense fallback={<DashboardFallback />}>
                <PageShell><Outlet /></PageShell>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
