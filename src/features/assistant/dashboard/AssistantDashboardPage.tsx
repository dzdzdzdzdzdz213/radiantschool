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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle,currentColor 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
              <p className="mt-0.5 text-sm text-white/70">{today}</p>
            </div>
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
        <TodaySchedule data={scheduleData.map((s) => ({
          id: s.id,
          courseName: s.course,
          teacherName: s.name,
          roomName: s.room,
          startTime: s.time.split(' - ')[0] ?? '',
          endTime: s.time.split(' - ')[1] ?? '',
        }))} loading={scheduleLoading} />
        <RfidSummary data={rfidData} totalScans={kpi.rfidScansToday} loading={isLoading} />
      </div>
    </motion.div>
  );
}