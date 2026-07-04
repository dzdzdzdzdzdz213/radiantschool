import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
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

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const {
    kpi, children, upcomingClasses, recentPayments,
    invoices, homeworkItems, activities, notifications,
    isLoading, isError, childrenLoading,
  } = useParentDashboard();

  if (isError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('dashboard.greeting', lang, profile?.firstName ?? '')}</h1><p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle.parent', lang)}</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">{t('dashboard.load_error', lang)}</p>
          <p className="text-sm text-red-500 mt-1">{t('dashboard.load_error_retry', lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.greeting', lang, profile?.firstName ?? '')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle.parent', lang)}</p>
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <KpiCards kpi={kpi} loading={isLoading} />
      </div>

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ChildrenOverview childList={children} loading={childrenLoading} />
        <UpcomingClasses data={upcomingClasses} loading={isLoading} />
        <AttendanceSummary childList={children} loading={childrenLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <HomeworkStatus data={homeworkItems} loading={isLoading} />
        <RecentPayments data={recentPayments} loading={isLoading} />
        <InvoicesSummary data={invoices} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTimeline data={activities} loading={isLoading} />
        <NotificationsWidget data={notifications} loading={isLoading} />
      </div>
    </div>
  );
}
