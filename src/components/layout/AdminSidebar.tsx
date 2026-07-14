import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck, DollarSign,
  FileText, Calendar, BarChart3, MessageSquare, UserCircle, Settings,
  Bell, Search, X, MapPin, ChevronLeft, GraduationCap, Star, UserPlus,
  Award, Megaphone, Video, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { asset } from '@/lib/assets';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, BookOpen, ClipboardCheck, DollarSign,
  FileText, Calendar, BarChart3, MessageSquare, UserCircle, Settings,
  Bell, Search, GraduationCap, Star, UserPlus,
  Award, Megaphone, Video, Clock,
};

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

interface AdminSidebarProps {
  items: NavItem[];
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

function NavLink({ item, collapsed, isActive, onClick }: { item: NavItem; collapsed: boolean; isActive: boolean; onClick: () => void }) {
  const Icon = iconMap[item.icon];
  const link = (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'text-white shadow-md'
          : 'text-sidebar-fg/60 hover:bg-sidebar-accent hover:text-sidebar-fg',
      )}
      style={isActive ? { background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' } : {}}
    >
      {Icon && <Icon className={cn('h-5 w-5 shrink-0 transition-all duration-300', isActive ? 'scale-110' : '')} />}
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="truncate"
        >
          {item.label}
        </motion.span>
      )}
      {item.badge && !collapsed && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
          {item.badge}
        </span>
      )}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{item.badge}</span> : null}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
}

const ease = [0.16, 1, 0.3, 1] as const;
const sidebarVariants = {
  open: { width: 256, transition: { duration: 0.3, ease } },
  collapsed: { width: 72, transition: { duration: 0.3, ease } },
};

export default function AdminSidebar({ items, open, collapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
  const location = useLocation();
  const { lang } = useLang();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'open'}
        initial={false}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar-bg lg:static',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' }}>
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={asset('logo-transparent.webp')}
              alt="Radiant Learning"
              className="h-8 w-8 shrink-0 rounded-lg object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate font-semibold text-white"
              >
                Radiant Learning
              </motion.span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-fg/40 hover:bg-sidebar-accent hover:text-sidebar-fg transition-colors"
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
            <button onClick={onClose} className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-sidebar-fg/40 hover:bg-sidebar-accent hover:text-sidebar-fg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-3">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                collapsed={collapsed}
                isActive={location.pathname === item.path}
                onClick={onClose}
              />
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-3">
          {collapsed ? (
            <div className="flex items-center justify-center">
              <MapPin className="h-4 w-4 text-sidebar-fg/40" />
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl bg-sidebar-accent p-3">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sidebar-accent-fg" />
              <p className="text-[11px] leading-tight text-sidebar-fg/60">
                {t('dashboard.location', lang)}
              </p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
