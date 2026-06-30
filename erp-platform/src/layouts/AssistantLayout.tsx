import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import type { NavItem } from '@/components/layout/Sidebar';

const items: NavItem[] = [
  { label: 'Tableau de bord', path: '/assistant/dashboard', icon: 'LayoutDashboard' },
  { label: 'Élèves', path: '/assistant/users', icon: 'Users' },
  { label: 'Cours', path: '/assistant/courses', icon: 'BookOpen' },
  { label: 'Présences', path: '/assistant/attendance', icon: 'ClipboardCheck' },
  { label: 'Paiements', path: '/assistant/payments', icon: 'DollarSign' },
  { label: 'Factures', path: '/assistant/invoices', icon: 'FileText' },
  { label: 'Emploi du temps', path: '/assistant/schedule', icon: 'Calendar' },
  { label: 'Messages', path: '/assistant/messages', icon: 'MessageSquare' },
  { label: 'Profil', path: '/assistant/profile', icon: 'UserCircle' },
];

export default function AssistantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar items={items} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
