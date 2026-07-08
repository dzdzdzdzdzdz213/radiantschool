import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export default function AdminLayout() {
  const { lang } = useLang();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { if (meta.parentElement) meta.parentElement.removeChild(meta); };
  }, []);
  const adminNavItems: NavItem[] = [
    { label: t('nav.dashboard', lang), path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: t('nav.users', lang), path: '/admin/users', icon: 'Users' },
    { label: t('nav.courses', lang), path: '/admin/courses', icon: 'BookOpen' },
    { label: t('nav.attendance', lang), path: '/admin/attendance', icon: 'ClipboardCheck' },
    { label: t('nav.payments', lang), path: '/admin/payments', icon: 'DollarSign' },
    { label: t('nav.invoices', lang), path: '/admin/invoices', icon: 'FileText' },
    { label: t('nav.schedule', lang), path: '/admin/schedule', icon: 'Calendar' },
    { label: t('nav.reports', lang), path: '/admin/reports', icon: 'BarChart3' },
    { label: t('nav.messages', lang), path: '/admin/messages', icon: 'MessageSquare' },
    { label: t('nav.profile', lang), path: '/admin/profile', icon: 'UserCircle' },
    { label: t('nav.settings', lang), path: '/admin/settings', icon: 'Settings' },
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('admin_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="gradient-mesh-fixed">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>
      <div className="relative z-10">
        <AdminSidebar
          items={adminNavItems}
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <ErrorBoundary>
              <Suspense fallback={<DashboardFallback />}>
                <AnimatePresence mode="wait">
                  <motion.div key={location.pathname} {...pageTransition}>
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
