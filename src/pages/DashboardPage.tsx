import { useEffect } from 'react';
import { useDashboardKPI, useNotifications } from '@/hooks/useQueries';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency } from '@/lib/utils';
import { Users, BookOpen, DollarSign, CalendarCheck, Bell, TrendingUp, TrendingDown, Sparkles, LayoutGrid, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';

function StatCard({ title, value, icon: Icon, color, trend }: { title: string; value: string | number; icon: React.ElementType; color: string; trend?: { up: boolean; pct: string } }) {
  const { lang } = useLang();
  return (
    <div className="stat-card-new">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--fg-muted)' }}>{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
              <span style={{ color: trend.up ? '#10b981' : '#f87171' }}>{trend.pct}</span>
              <span style={{ color: 'var(--fg-muted)' }}>{t('common.this_month', lang)}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-xl p-3.5" style={{ backgroundColor: 'var(--primary-light)' }}>
          <Icon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS: Record<string, { label: string; path: string; descKey: string; emoji: string }[]> = {
  admin: [
    { label: 'quick.users', path: '/admin/users', descKey: 'quick.users.desc', emoji: '👤' },
    { label: 'quick.courses', path: '/admin/courses', descKey: 'quick.courses.desc', emoji: '📚' },
    { label: 'quick.attendance', path: '/admin/attendance', descKey: 'quick.attendance.desc', emoji: '✅' },
    { label: 'quick.payments', path: '/admin/payments', descKey: 'quick.payments.desc', emoji: '💰' },
  ],
  assistant: [
    { label: 'quick.users', path: '/assistant/users', descKey: 'quick.users.desc', emoji: '👤' },
    { label: 'quick.courses', path: '/assistant/courses', descKey: 'quick.courses.desc', emoji: '📚' },
    { label: 'quick.attendance', path: '/assistant/attendance', descKey: 'quick.attendance.desc', emoji: '✅' },
    { label: 'quick.payments', path: '/assistant/payments', descKey: 'quick.payments.desc', emoji: '💰' },
  ],
  teacher: [
    { label: 'quick.my_courses', path: '/teacher/courses', descKey: 'quick.my_courses.desc', emoji: '📚' },
    { label: 'quick.attendance', path: '/teacher/attendance', descKey: 'quick.attendance.teach', emoji: '✅' },
    { label: 'quick.schedule', path: '/teacher/schedule', descKey: 'quick.schedule.desc', emoji: '📅' },
    { label: 'quick.evaluations', path: '/teacher/evaluations', descKey: 'quick.evaluations.desc', emoji: '⭐' },
  ],
  student: [
    { label: 'quick.my_courses', path: '/student/courses', descKey: 'quick.my_courses.desc.student', emoji: '📚' },
    { label: 'quick.schedule', path: '/student/schedule', descKey: 'quick.schedule.desc.student', emoji: '📅' },
    { label: 'quick.payments', path: '/student/payments', descKey: 'quick.payments.desc', emoji: '💰' },
    { label: 'quick.invoices', path: '/student/invoices', descKey: 'quick.invoices.desc', emoji: '📄' },
  ],
  parent: [
    { label: 'quick.children', path: '/parent/children', descKey: 'quick.children.desc', emoji: '👤' },
    { label: 'quick.schedule', path: '/parent/schedule', descKey: 'quick.schedule.desc', emoji: '📅' },
    { label: 'quick.payments', path: '/parent/payments', descKey: 'quick.payments.desc', emoji: '💰' },
    { label: 'quick.invoices', path: '/parent/invoices', descKey: 'quick.invoices.desc', emoji: '📄' },
  ],
};

const ROLE_STATS: Record<string, { titleKey: string; key: string; icon: React.ElementType; color: string }[]> = {
  admin: [
    { titleKey: 'dashboard.stat.revenue', key: 'total_revenue', icon: DollarSign, color: 'green' },
    { titleKey: 'dashboard.stat.active_students', key: 'active_students', icon: Users, color: 'blue' },
    { titleKey: 'dashboard.stat.new_students', key: 'new_students_month', icon: TrendingUp, color: 'purple' },
    { titleKey: 'dashboard.stat.occupancy', key: 'occupancy_rate', icon: CalendarCheck, color: 'orange' },
  ],
  assistant: [
    { titleKey: 'dashboard.stat.active_students', key: 'active_students', icon: Users, color: 'blue' },
    { titleKey: 'dashboard.stat.new_students', key: 'new_students_month', icon: TrendingUp, color: 'purple' },
    { titleKey: 'dashboard.stat.revenue', key: 'total_revenue', icon: DollarSign, color: 'green' },
    { titleKey: 'dashboard.stat.occupancy', key: 'occupancy_rate', icon: CalendarCheck, color: 'orange' },
  ],
  teacher: [
    { titleKey: 'dashboard.stat.active_students', key: 'active_students', icon: Users, color: 'blue' },
    { titleKey: 'dashboard.stat.courses', key: 'active_courses', icon: BookOpen, color: 'purple' },
    { titleKey: 'dashboard.stat.occupancy', key: 'occupancy_rate', icon: CalendarCheck, color: 'orange' },
    { titleKey: 'dashboard.stat.evaluations', key: 'evaluation_count', icon: TrendingUp, color: 'teal' },
  ],
  student: [
    { titleKey: 'dashboard.stat.my_courses', key: 'my_courses', icon: BookOpen, color: 'purple' },
    { titleKey: 'dashboard.stat.attendance', key: 'attendance_rate', icon: CalendarCheck, color: 'blue' },
    { titleKey: 'dashboard.stat.next_payment', key: 'next_payment', icon: DollarSign, color: 'green' },
  ],
  parent: [
    { titleKey: 'dashboard.stat.children', key: 'children_count', icon: Users, color: 'blue' },
    { titleKey: 'dashboard.stat.next_payment', key: 'next_payment', icon: DollarSign, color: 'green' },
    { titleKey: 'dashboard.stat.attendance_rate', key: 'attendance_rate', icon: CalendarCheck, color: 'orange' },
  ],
};

function formatStatValue(key: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (key === 'total_revenue') return formatCurrency(value);
  if (key === 'next_payment') return value > 0 ? formatCurrency(value) : '—';
  if (key === 'occupancy_rate' || key === 'attendance_rate') return `${value}%`;
  if (key === 'average_rating') return value.toFixed(1);
  if (key === 'evaluation_count') return `${value}`;
  return String(value);
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const { data: kpi, isLoading: kpiLoading, isError: kpiError } = useDashboardKPI();
  const { data: notifications, isLoading: notifLoading } = useNotifications();

  const role = profile?.role ?? 'admin';
  const stats = ROLE_STATS[role] ?? ROLE_STATS.admin;
  const actions = QUICK_ACTIONS[role] ?? QUICK_ACTIONS.admin;

  useEffect(() => {
    if (kpiError) toast(t('errors.load_error', lang, 'des indicateurs'), 'error');
  }, [kpiError]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="welcome-glow rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-light)' }}>
            <Sparkles className="h-7 w-7" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('dashboard.greeting', lang, profile?.firstName || '')}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{t(`dashboard.subtitle.${role}`, lang)}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center ml-auto gap-2 rounded-xl px-4 py-2 text-xs font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <LayoutGrid className="h-3.5 w-3.5" />
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiLoading ? (
          <>
            {stats.map((s) => (
              <StatCard key={s.key} title={t(s.titleKey, lang)} value="—" icon={s.icon} color={s.color} />
            ))}
          </>
        ) : (
          stats.map((s) => (
            <StatCard
              key={s.key}
              title={t(s.titleKey, lang)}
              value={formatStatValue(s.key, (kpi as any)?.[s.key] as number | null | undefined)}
              icon={s.icon}
              color={s.color}
            />
          ))
        )}
      </div>

        {/* Quick Actions + Notifications */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <div className="card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-light)' }}>
                <LayoutGrid className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-base font-semibold tracking-tight">{t('dashboard.quick_actions', lang)}</h2>
            </div>
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }} />
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--fg-muted)', opacity: 0.4 }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((a) => (
              <Link key={a.path} to={a.path} className="quick-action">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-lg mx-auto mb-2.5 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)' }}>
                  {a.emoji}
                </div>
                <p className="text-sm font-medium">{t(a.label, lang)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>{t(a.descKey, lang)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <Bell className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="text-base font-semibold tracking-tight">{t('dashboard.notifications', lang)}</h2>
              </div>
              {notifications && notifications.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                  {notifications.length}
                </span>
              )}
            </div>
            {notifLoading ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--fg-muted)' }}>{t('common.loading', lang)}</div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="notif-item flex items-start gap-3"
                    style={{ backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)' }}
                  >
                    <div className="mt-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: !n.is_read ? 'var(--primary)' : 'var(--fg-muted)', opacity: n.is_read ? 0.3 : 1 }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug truncate">{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--fg-muted)' }}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="mb-2 h-6 w-6" style={{ color: 'var(--fg-muted)', opacity: 0.15 }} />
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{t('dashboard.no_notifications', lang)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
