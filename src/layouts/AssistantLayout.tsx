import { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { NavItem } from '@/components/layout/AdminSidebar';

function DashboardFallback() {
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[340px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-500">{children}</div>;
}

export default function AssistantLayout() {
  const { lang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { if (meta.parentElement) meta.parentElement.removeChild(meta); };
  }, []);
  const assistantNavItems: NavItem[] = [
    { label: t('nav.dashboard', lang), path: '/assistant/dashboard', icon: 'LayoutDashboard' },
    { label: t('nav.students', lang), path: '/assistant/students', icon: 'Users' },
    { label: t('nav.parents', lang), path: '/assistant/parents', icon: 'Users' },
    { label: t('nav.registrations', lang), path: '/assistant/registrations', icon: 'ClipboardCheck' },
    { label: t('nav.attendance', lang), path: '/assistant/attendance', icon: 'ClipboardCheck' },
    { label: t('nav.rfid', lang), path: '/assistant/rfid', icon: 'ClipboardCheck' },
    { label: t('nav.groups', lang), path: '/assistant/groups', icon: 'BookOpen' },
    { label: t('nav.schedule', lang), path: '/assistant/schedules', icon: 'Calendar' },
    { label: t('nav.rooms', lang), path: '/assistant/rooms', icon: 'MapPin' },
    { label: t('nav.payments', lang), path: '/assistant/payments', icon: 'DollarSign' },
    { label: t('nav.invoices', lang), path: '/assistant/invoices', icon: 'FileText' },
    { label: t('nav.notifications', lang), path: '/assistant/notifications', icon: 'Bell' },
    { label: t('nav.emails', lang), path: '/assistant/emails', icon: 'MessageSquare' },
    { label: t('nav.resources', lang), path: '/assistant/resources', icon: 'FileText' },
    { label: t('nav.campaigns', lang), path: '/assistant/campaigns', icon: 'BarChart3' },
    { label: t('nav.reports', lang), path: '/assistant/reports', icon: 'BarChart3' },
    { label: t('nav.calendar', lang), path: '/assistant/calendar', icon: 'Calendar' },
    { label: t('nav.search', lang), path: '/assistant/search', icon: 'Search' },
    { label: t('nav.settings', lang), path: '/assistant/settings', icon: 'Settings' },
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('assistant_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('assistant_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        items={assistantNavItems}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <ErrorBoundary>
              <Suspense fallback={<DashboardFallback />}>
                <PageShell>
                  <Outlet />
                </PageShell>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
