import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssistantDashboard } from './useAssistantDashboard';
import KpiCards from './components/KpiCards';
import QuickActions from './components/QuickActions';
import AlertsWidget from './components/AlertsWidget';
import PendingRegistrations from './components/PendingRegistrations';
import OverduePayments from './components/OverduePayments';
import ActiveTeachers from './components/ActiveTeachers';
import TodaySchedule from './components/TodaySchedule';
import RfidSummary from './components/RfidSummary';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="cahier-margin rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{today}</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[104px] rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AssistantDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
      const { kpi, pendingRegistrations, overduePayments, activeTeachers, alerts, quickActions, scheduleData, scheduleLoading, rfidData, isLoading, isError } = useAssistantDashboard(lang);

  if (isLoading) return <LoadingGrid />;

  if (isError) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader name={profile?.firstName ?? ''} />
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">{t('dashboard.load_error', lang)}</p>
          <p className="text-sm text-red-500 mt-1">{t('dashboard.load_error_retry', lang)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader name={profile?.firstName ?? ''} />

      <AlertsWidget alerts={alerts} loading={isLoading} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <KpiCards kpi={kpi} loading={isLoading} />
      </div>

      <QuickActions actions={quickActions} />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <PendingRegistrations data={pendingRegistrations} loading={isLoading} />
        <OverduePayments data={overduePayments} loading={isLoading} />
        <ActiveTeachers data={activeTeachers} loading={isLoading} />
        <TodaySchedule data={scheduleData} loading={scheduleLoading} />
        <RfidSummary data={rfidData} totalScans={kpi.rfidScansToday} loading={isLoading} />
      </div>
    </motion.div>
  );
}