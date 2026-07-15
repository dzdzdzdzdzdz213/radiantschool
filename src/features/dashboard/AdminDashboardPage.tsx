import { Sparkles, DollarSign, Users, CalendarCheck, Building2, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboard, type AnalyticsMetric } from '@/features/dashboard/useAdminDashboard';
import AlertBanner from '@/features/dashboard/components/AlertBanner';
import KpiCard from '@/features/dashboard/components/KpiCard';
import RevenueChartWidget from '@/features/dashboard/components/RevenueChartWidget';
import OccupancyChartWidget from '@/features/dashboard/components/OccupancyChartWidget';
import ActivityTimeline from '@/features/dashboard/components/ActivityTimeline';
import TodaySchedule from '@/features/dashboard/components/TodaySchedule';
import QuickActions from '@/features/dashboard/components/QuickActions';
import RecentRegistrationsTable from '@/features/dashboard/components/RecentRegistrationsTable';
import AttendanceWidget from '@/features/dashboard/components/AttendanceWidget';
import AnalyticsWidget from '@/features/dashboard/components/AnalyticsWidget';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Card className="welcome-glow relative overflow-hidden">
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
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const {
    kpi, revenueData, occupancyData, scheduleData, activityData,
    recentRegistrations, attendanceSummary, alertItems,
    isLoading, isError,
  } = useAdminDashboard();

  if (isLoading) return <LoadingGrid />;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader name={profile?.firstName ?? ''} />
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">{t('dashboard.load_error', lang)}</p>
          <p className="text-sm text-red-500 mt-1">{t('dashboard.load_error_retry', lang)}</p>
        </div>
      </div>
    );
  }

  const analyticsMetrics: AnalyticsMetric[] = [
    { label: t('dashboard.stat.revenue', lang), value: formatCurrency(kpi.totalRevenue / Math.max(kpi.activeStudents, 1)), change: 8, trend: 'up' },
    { label: t('dashboard.stat.retention', lang), value: kpi.attendanceRate != null ? `${kpi.attendanceRate}%` : '—', change: 0, trend: 'neutral' },
    { label: t('dashboard.stat.new_students', lang), value: String(kpi.newStudentsMonth), change: kpi.newStudentsMonth > 0 ? 12 : 0, trend: kpi.newStudentsMonth > 0 ? 'up' : 'neutral' },
    { label: t('dashboard.stat.courses', lang), value: String(revenueData.length > 0 ? Math.ceil(revenueData.length / 3) : '—'), change: 0, trend: 'neutral' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader name={profile?.firstName ?? ''} />

      <AlertBanner items={alertItems} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title={t('common.revenue', lang)}
          value={formatCurrency(kpi.totalRevenue)}
          subtitle="30 derniers jours"
          icon={DollarSign}
          trend={{ up: true, pct: '+12%' }}
        />
        <KpiCard
          title={t('dashboard.stat.active_students', lang)}
          value={String(kpi.activeStudents)}
          subtitle={t('dashboard.stat.new_students', lang)}
          icon={Users}
          trend={kpi.newStudentsMonth > 0 ? { up: true, pct: `+${kpi.newStudentsMonth}` } : undefined}
        />
        <KpiCard
          title={t('dashboard.stat.attendance', lang)}
          value={kpi.attendanceRate != null ? `${kpi.attendanceRate}%` : '—'}
          subtitle={t('dashboard.stat.avg_grade', lang)}
          icon={CalendarCheck}
          trend={kpi.attendanceRate != null && kpi.attendanceRate >= 90 ? { up: true, pct: '+3%' } : { up: false, pct: '-2%' }}
        />
        <KpiCard
          title={t('dashboard.stat.occupancy', lang)}
          value={kpi.occupancyRate != null ? `${kpi.occupancyRate}%` : '—'}
          subtitle={t('dashboard.stat.occupancy', lang)}
          icon={Building2}
        />
        <KpiCard
          title={t('nav.registrations', lang)}
          value={String(kpi.newStudentsMonth)}
          subtitle={t('common.this_month', lang)}
          icon={TrendingUp}
          trend={kpi.newStudentsMonth > 5 ? { up: true, pct: '+18%' } : undefined}
        />
        <KpiCard
          title={t('status.alert', lang)}
          value={String(kpi.pendingApprovals + kpi.unpaidInvoices)}
          subtitle={`${kpi.pendingApprovals} en attente, ${kpi.unpaidInvoices} impayés`}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChartWidget data={revenueData} />
        <OccupancyChartWidget data={occupancyData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentRegistrationsTable data={recentRegistrations} />
          <QuickActions />
        </div>
        <div className="space-y-6">
          <AttendanceWidget data={attendanceSummary} />
          <AnalyticsWidget metrics={analyticsMetrics} title={t('dashboard.stat.analytics', lang)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTimeline items={activityData} />
        <TodaySchedule data={scheduleData} />
      </div>
    </div>
  );
}
