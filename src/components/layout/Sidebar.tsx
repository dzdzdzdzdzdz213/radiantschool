import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck, DollarSign,
  FileText, Calendar, BarChart3, MessageSquare, UserCircle, Settings,
  Star, GraduationCap, X, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, BookOpen, ClipboardCheck, DollarSign,
  FileText, Calendar, BarChart3, MessageSquare, UserCircle, Settings,
  Star, GraduationCap,
};

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ items, open, onClose }: SidebarProps) {
  const location = useLocation();
  const { lang } = useLang();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' }}>
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-sm backdrop-blur-sm">RL</div>
            <span className="font-semibold text-base text-white">Radiant Learning</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground hover:translate-x-0.5',
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start gap-2.5 rounded-lg p-2.5" style={{ backgroundColor: 'var(--primary-light)' }}>
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
            <p className="text-[11px] leading-tight" style={{ color: 'var(--fg-muted)' }}>
              {t('dashboard.location', lang)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
