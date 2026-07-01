import { useState, lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import BackButton from '@/components/ui/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import type { NavItem } from '@/components/layout/AdminSidebar';

const studentNavItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/student/dashboard', icon: 'LayoutDashboard' },
  { label: 'Mes cours', path: '/student/courses', icon: 'BookOpen' },
  { label: 'Emploi du temps', path: '/student/schedule', icon: 'Calendar' },
  { label: 'Calendrier', path: '/student/calendar', icon: 'Calendar' },
  { label: 'Présences', path: '/student/attendance', icon: 'ClipboardCheck' },
  { label: 'Devoirs', path: '/student/homework', icon: 'FileText' },
  { label: 'Ressources', path: '/student/resources', icon: 'GraduationCap' },
  { label: 'Cours en ligne', path: '/student/online-classes', icon: 'Video' },
  { label: 'Cours particuliers', path: '/student/private-lessons', icon: 'UserPlus' },
  { label: 'Cours VIP', path: '/student/vip-classes', icon: 'Star' },
  { label: 'Paiements', path: '/student/payments', icon: 'DollarSign' },
  { label: 'Factures', path: '/student/invoices', icon: 'FileText' },
  { label: 'Certificats', path: '/student/certificates', icon: 'Award' },
  { label: 'Annonces', path: '/student/announcements', icon: 'Megaphone' },
  { label: 'Messages', path: '/student/messages', icon: 'MessageSquare' },
  { label: 'Avis', path: '/student/reviews', icon: 'Star' },
  { label: 'Notifications', path: '/student/notifications', icon: 'Bell' },
  { label: 'Profil', path: '/student/profile', icon: 'UserCircle' },
  { label: 'Paramètres', path: '/student/settings', icon: 'Settings' },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-500">{children}</div>;
}

function DashboardFallback() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-border bg-card p-8"><div className="flex items-center gap-4"><Skeleton className="h-14 w-14 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-40" /></div></div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-16" /></div>))}</div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[340px] rounded-2xl" /><Skeleton className="h-[340px] rounded-2xl" /></div>
    </div>
  );
}

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('student_sidebar_collapsed');
    return saved === 'true';
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('student_sidebar_collapsed', String(next));
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
            <div className="mb-4"><BackButton label="← Retour au site" to="/" /></div>
            <Suspense fallback={<DashboardFallback />}>
              <PageShell><Outlet /></PageShell>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}