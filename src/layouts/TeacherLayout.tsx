import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BackButton from '@/components/ui/BackButton';
import type { NavItem } from '@/components/layout/Sidebar';

const items: NavItem[] = [
  { label: 'Tableau de bord', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
  { label: 'Mes cours', path: '/teacher/courses', icon: 'BookOpen' },
  { label: 'Présences', path: '/teacher/attendance', icon: 'ClipboardCheck' },
  { label: 'Emploi du temps', path: '/teacher/schedule', icon: 'Calendar' },
  { label: 'Messages', path: '/teacher/messages', icon: 'MessageSquare' },
  { label: 'Mes évaluations', path: '/teacher/evaluations', icon: 'Star' },
  { label: 'Classement', path: '/teacher/leaderboard', icon: 'BarChart3' },
  { label: 'Profil', path: '/teacher/profile', icon: 'UserCircle' },
];

export default function TeacherLayout() {
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
