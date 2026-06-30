import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import type { NavItem } from '@/components/layout/Sidebar';

const adminNavItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Utilisateurs', path: '/admin/users', icon: 'Users' },
  { label: 'Cours', path: '/admin/courses', icon: 'BookOpen' },
  { label: 'Présences', path: '/admin/attendance', icon: 'ClipboardCheck' },
  { label: 'Paiements', path: '/admin/payments', icon: 'DollarSign' },
  { label: 'Factures', path: '/admin/invoices', icon: 'FileText' },
  { label: 'Emploi du temps', path: '/admin/schedule', icon: 'Calendar' },
  { label: 'Rapports', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'Messages', path: '/admin/messages', icon: 'MessageSquare' },
  { label: 'Profil', path: '/admin/profile', icon: 'UserCircle' },
  { label: 'Paramètres', path: '/admin/settings', icon: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar items={adminNavItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <BackButton label="← Retour au site" to="/" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
