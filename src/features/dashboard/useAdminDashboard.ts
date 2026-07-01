import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api, type PaginatedResult } from '@/lib/api';
import { useDashboardKPI, useRevenueChartData, useOccupancyData, useTodaySchedule, useRecentActivity, useAdminAlerts } from '@/hooks/useQueries';
import { useRealtimeDashboard } from '@/hooks/useRealtime';

export interface KpiData {
  totalRevenue: number;
  activeStudents: number;
  attendanceRate: number | null;
  occupancyRate: number | null;
  newStudentsMonth: number;
  pendingApprovals: number;
  unpaidInvoices: number;
}

export interface AlertItem {
  severity: 'critical' | 'warning' | 'info';
  icon: string;
  title: string;
  description: string;
  action?: { label: string; path: string };
}

export interface RecentRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  level: string | null;
  createdAt: string;
  status: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export function useAdminDashboard() {
  // Activer les souscriptions realtime pour toutes les données du dashboard
  useRealtimeDashboard();

  const kpi = useDashboardKPI();
  const revenue = useRevenueChartData();
  const occupancy = useOccupancyData();
  const schedule = useTodaySchedule();
  const activity = useRecentActivity();
  const alerts = useAdminAlerts();

  // Inscriptions récentes avec l'API layer (pagination, filtres)
  const registrationsQuery = useQuery({
    queryKey: ['recent_registrations'],
    queryFn: () => api.list<RecentRegistration>(
      'users',
      {
        pagination: { page: 1, pageSize: 10 },
        sort: [{ column: 'created_at', direction: 'desc' }],
        filters: [{ column: 'deleted_at', operator: 'is', value: null }],
      },
      'id, first_name, last_name, email, phone, status, created_at',
    ),
    staleTime: 15_000,
  });

  // Résumé des présences du jour
  const attendanceSummaryQuery = useQuery({
    queryKey: ['attendance_summary_today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance')
        .select('status')
        .eq('date', today);
      const records = data ?? [];
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const total = records.length;
      return {
        present, absent, late, total,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
      } as AttendanceSummary;
    },
    staleTime: 10_000,
  });

  const isLoading = kpi.isLoading || revenue.isLoading || occupancy.isLoading || schedule.isLoading || activity.isLoading || alerts.isLoading || registrationsQuery.isLoading;
  const isError = kpi.isError || revenue.isError;

  // Construire les alertes depuis les données
  const alertItems: AlertItem[] = [];

  if (alerts.data?.pendingApprovals && alerts.data.pendingApprovals > 0) {
    alertItems.push({
      severity: 'warning',
      icon: '📋',
      title: `${alerts.data.pendingApprovals} inscription${alerts.data.pendingApprovals > 1 ? 's' : ''} en attente`,
      description: 'Ces inscriptions nécessitent une validation manuelle',
      action: { label: 'Voir', path: '/admin/users' },
    });
  }

  if (alerts.data?.overdueInvoices && alerts.data.overdueInvoices.length > 0) {
    alertItems.push({
      severity: 'critical',
      icon: '💰',
      title: `${alerts.data.overdueInvoices.length} facture${alerts.data.overdueInvoices.length > 1 ? 's' : ''} impayée${alerts.data.overdueInvoices.length > 1 ? 's' : ''}`,
      description: 'Factures en retard de paiement',
      action: { label: 'Voir', path: '/admin/invoices' },
    });
  }

  if (alerts.data?.nearFullCourses && alerts.data.nearFullCourses.length > 0) {
    alertItems.push({
      severity: 'info',
      icon: '📊',
      title: `${alerts.data.nearFullCourses.length} cours ${alerts.data.nearFullCourses.length > 1 ? 'sont' : 'est'} presque plein${alerts.data.nearFullCourses.length > 1 ? 's' : ''}`,
      description: `Capacité à plus de 80%`,
      action: { label: 'Voir', path: '/admin/courses' },
    });
  }

  const kpiData: KpiData = {
    totalRevenue: kpi.data?.total_revenue ?? 0,
    activeStudents: kpi.data?.active_students ?? 0,
    attendanceRate: kpi.data?.attendance_rate ?? null,
    occupancyRate: kpi.data?.occupancy_rate ?? null,
    newStudentsMonth: kpi.data?.new_students_month ?? 0,
    pendingApprovals: kpi.data?.pending_approvals ?? 0,
    unpaidInvoices: kpi.data?.unpaid_invoices ?? 0,
  };

  const registrations: RecentRegistration[] = (registrationsQuery.data?.data ?? []).map((r: any) => ({
    id: r.id,
    firstName: r.first_name ?? '',
    lastName: r.last_name ?? '',
    email: r.email ?? '',
    phone: r.phone ?? null,
    level: r.level ?? null,
    createdAt: r.created_at ?? '',
    status: r.status ?? '',
  }));

  return {
    kpi: kpiData,
    revenueData: revenue.data ?? [],
    occupancyData: occupancy.data ?? [],
    scheduleData: schedule.data ?? [],
    activityData: activity.data ?? [],
    recentRegistrations: registrations,
    attendanceSummary: attendanceSummaryQuery.data ?? { present: 0, absent: 0, late: 0, total: 0, rate: 0 },
    alertItems,
    isLoading,
    isError,
  };
}
