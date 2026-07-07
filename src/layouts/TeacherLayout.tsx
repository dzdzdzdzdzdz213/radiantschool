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
      <div className="rounded-2xl border border-border bg-card p-8"><div className="flex items-center gap-4"><Skeleton className="h-14 w-14 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-40" /></div></div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-16" /></div>))}</div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[340px] rounded-2xl" /><Skeleton className="h-[340px] rounded-2xl" /></div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-500">{children}</div>;
}

export default function TeacherLayout() {
  const { lang } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { if (meta.parentElement) meta.parentElement.removeChild(meta); };
  }, []);
  const teacherNavItems: NavItem[] = [
    { label: t('nav.dashboard', lang), path: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { label: t('nav.my_schedule', lang), path: '/teacher/schedule', icon: 'Calendar' },
    { label: t('nav.calendar', lang), path: '/teacher/calendar', icon: 'Calendar' },
    { label: t('nav.my_courses', lang), path: '/teacher/courses', icon: 'BookOpen' },
    { label: t('nav.attendance', lang), path: '/teacher/attendance', icon: 'ClipboardCheck' },
    { label: t('nav.students', lang), path: '/teacher/students', icon: 'Users' },
    { label: t('nav.assignments', lang), path: '/teacher/assignments', icon: 'FileText' },
    { label: t('nav.homework', lang), path: '/teacher/homework', icon: 'FileText' },
    { label: t('nav.resources', lang), path: '/teacher/resources', icon: 'FileText' },
    { label: t('nav.online_classes', lang), path: '/teacher/online-classes', icon: 'GraduationCap' },
    { label: t('nav.private_lessons', lang), path: '/teacher/private-lessons', icon: 'UserPlus' },
    { label: t('nav.vip_classes', lang), path: '/teacher/vip-classes', icon: 'Star' },
    { label: t('nav.announcements', lang), path: '/teacher/announcements', icon: 'Bell' },
    { label: t('nav.messages', lang), path: '/teacher/messages', icon: 'MessageSquare' },
    { label: t('nav.reports', lang), path: '/teacher/reports', icon: 'BarChart3' },
    { label: t('nav.payments', lang), path: '/teacher/revenue', icon: 'DollarSign' },
    { label: t('nav.reviews', lang), path: '/teacher/reviews', icon: 'Star' },
    { label: t('nav.profile', lang), path: '/teacher/profile', icon: 'UserCircle' },
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('teacher_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('teacher_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar
        items={teacherNavItems}
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
                <PageShell><Outlet /></PageShell>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
