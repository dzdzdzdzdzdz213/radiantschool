import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import type { NavItem } from '@/components/layout/Sidebar';

const items: NavItem[] = [
  { label: 'Tableau de bord', path: '/parent/dashboard', icon: 'LayoutDashboard' },
  { label: 'Mes enfants', path: '/parent/children', icon: 'Users' },
  { label: "S'inscrire", path: '/parent/enroll', icon: 'GraduationCap' },
  { label: 'Emploi du temps', path: '/parent/schedule', icon: 'Calendar' },
  { label: 'Paiements', path: '/parent/payments', icon: 'DollarSign' },
  { label: 'Factures', path: '/parent/invoices', icon: 'FileText' },
  { label: 'Messages', path: '/parent/messages', icon: 'MessageSquare' },
  { label: 'Profil', path: '/parent/profile', icon: 'UserCircle' },
];

export default function ParentLayout() {
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
