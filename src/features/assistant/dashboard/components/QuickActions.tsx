import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, FileText, DollarSign, ClipboardCheck, Bell, Calendar, Users, BarChart3, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import type { QuickAction } from '../useAssistantDashboard';

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap: Record<string, React.ElementType> = {
  UserPlus, FileText, DollarSign, ClipboardCheck, Bell, Calendar, Users, BarChart3, GraduationCap,
};

const colorMap: Record<string, string> = {
  UserPlus: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  FileText: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  DollarSign: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  ClipboardCheck: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  Bell: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  Calendar: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
  Users: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  BarChart3: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  GraduationCap: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
};

export default function QuickActions({ actions }: QuickActionsProps) {
  const navigate = useNavigate();
  const { lang } = useLang();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">{t('dashboard.quick_actions', lang)}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action, idx) => {
          const Icon = iconMap[action.icon];
          return (
            <motion.button
              key={`${action.path}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all hover:bg-accent hover:shadow-sm active:scale-95"
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorMap[action.icon] ?? 'bg-muted text-muted-foreground')}>
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}