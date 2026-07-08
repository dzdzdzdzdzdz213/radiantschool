import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useParentDashboard } from './useParentDashboard';
import KpiCards from './components/KpiCards';
import QuickActions from './components/QuickActions';
import ChildrenOverview from './components/ChildrenOverview';
import UpcomingClasses from './components/UpcomingClasses';
import AttendanceSummary from './components/AttendanceSummary';
import RecentPayments from './components/RecentPayments';
import HomeworkStatus from './components/HomeworkStatus';
import InvoicesSummary from './components/InvoicesSummary';
import NotificationsWidget from './components/NotificationsWidget';
import ActivityTimeline from './components/ActivityTimeline';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-radial from-primary/[0.06] to-transparent" />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('dashboard.greeting', lang, name)}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[104px] rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
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

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const {
    kpi, children, upcomingClasses, recentPayments,
    invoices, homeworkItems, activities, notifications,
    isLoading, isError, childrenLoading,
  } = useParentDashboard();

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <KpiCards kpi={kpi} loading={isLoading} />
      </div>

      <QuickActions />

      <motion.div
        className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ChildrenOverview childList={children} loading={childrenLoading} />
        <UpcomingClasses data={upcomingClasses} loading={isLoading} />
        <AttendanceSummary childList={children} loading={childrenLoading} />
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <HomeworkStatus data={homeworkItems} loading={isLoading} />
        <RecentPayments data={recentPayments} loading={isLoading} />
        <InvoicesSummary data={invoices} loading={isLoading} />
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ActivityTimeline data={activities} loading={isLoading} />
        <NotificationsWidget data={notifications} loading={isLoading} />
      </motion.div>
    </motion.div>
  );
}
