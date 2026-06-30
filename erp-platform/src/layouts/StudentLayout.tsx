import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import type { NavItem } from '@/components/layout/Sidebar';

const items: NavItem[] = [
  { label: 'Tableau de bord', path: '/student/dashboard', icon: 'LayoutDashboard' },
  { label: 'Mes cours', path: '/student/courses', icon: 'BookOpen' },
  { label: "S'inscrire", path: '/student/enroll', icon: 'GraduationCap' },
  { label: 'Emploi du temps', path: '/student/schedule', icon: 'Calendar' },
  { label: 'Paiements', path: '/student/payments', icon: 'DollarSign' },
  { label: 'Factures', path: '/student/invoices', icon: 'FileText' },
  { label: 'Messages', path: '/student/messages', icon: 'MessageSquare' },
  { label: 'Évaluer mes profs', path: '/student/reviews', icon: 'Star' },

  { label: 'Profil', path: '/student/profile', icon: 'UserCircle' },
];

export default function StudentLayout() {
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
