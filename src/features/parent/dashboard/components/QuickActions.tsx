import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, FileText, MessageSquare, UserPlus, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function QuickActions() {
  const navigate = useNavigate();
  const { lang } = useLang();

  const actions = [
    { label: t('dashboard.quick_my_children', lang), icon: Users, path: '/parent/children', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { label: t('dashboard.quick_schedule', lang), icon: Calendar, path: '/parent/schedule', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
    { label: t('dashboard.quick_payments', lang), icon: DollarSign, path: '/parent/payments', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
    { label: t('dashboard.quick_invoices', lang), icon: FileText, path: '/parent/invoices', color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' },
    { label: t('dashboard.quick_messages', lang), icon: MessageSquare, path: '/parent/messages', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
    { label: t('dashboard.quick_enroll_child', lang), icon: UserPlus, path: '/parent/enroll', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
    { label: t('dashboard.quick_profile', lang), icon: School, path: '/parent/profile', color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">{t('dashboard.quick_actions', lang)}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.button key={action.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: idx * 0.02 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-accent hover:shadow-sm active:scale-95"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', action.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
