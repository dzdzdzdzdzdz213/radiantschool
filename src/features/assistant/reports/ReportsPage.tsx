import { useState } from 'react';
import { BarChart3,Download, FileText, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

const reportTypes = [
  { id: 'attendance', label: '', icon: BarChart3 },
  { id: 'revenue', label: '', icon: FileText },
  { id: 'registrations', label: '', icon: FileText },
  { id: 'payments', label: '', icon: FileText },
  { id: 'teacher_workload', label: '', icon: BarChart3 },
] as const;

export default function ReportsPage() {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const { toast } = useToast();
  const reportLabels: Record<string, string> = {
    attendance: t('reports.attendance', lang),
    revenue: t('reports.revenue', lang),
    registrations: t('reports.registrations', lang),
    payments: t('reports.payments', lang),
    teacher_workload: t('reports.teacher_workload', lang),
  };
  const [selected, setSelected] = useState('revenue');

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['assistant_report_revenue'],
    enabled: selected === 'revenue',
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('v_daily_revenue').select('*').order('date', { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['assistant_report_attendance'],
    enabled: selected === 'attendance',
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('v_daily_attendance').select('*').order('date', { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['assistant_report_registrations'],
    enabled: selected === 'registrations',
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('course_enrollments').select('id, enrollment_date, course:courses(name), student:students!student_id(first_name, last_name)').order('enrollment_date', { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['assistant_report_payments'],
    enabled: selected === 'payments',
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('payments').select('id, amount, payment_method, status, created_at, student:students!student_id(first_name, last_name)').order('created_at', { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: teacherWorkload, isLoading: workloadLoading } = useQuery({
    queryKey: ['assistant_report_teacher_workload'],
    enabled: selected === 'teacher_workload',
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('v_teacher_workload').select('*').order('total_hours', { ascending: false });
      return data ?? [];
    },
  });

  const isLoading = revenueLoading || attendanceLoading || registrationsLoading || paymentsLoading || workloadLoading;
  const isError = false;

  useErrorToast(isError, lang, t('reports.data', lang));

  const exportPDF = (filename: string) => {
    toast(t('reports.exporting', lang), 'info');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>;
    }
    if (selected === 'revenue') {
      if (!revenue || revenue.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return revenue.slice(0, 10).map((r: any) => (
        <div key={r.date} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{formatDate(r.date)}</span>
          <span className="text-sm font-semibold">{formatCurrency(r.amount ?? 0)}</span>
        </div>
      ));
    }
    if (selected === 'attendance') {
      if (!attendance || attendance.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return attendance.slice(0, 10).map((r: any) => (
        <div key={r.date} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{formatDate(r.date)}</span>
          <span className="text-sm">{r.present_count ?? 0} présentes / {r.total_count ?? 0}</span>
        </div>
      ));
    }
    if (selected === 'registrations') {
      if (!registrations || registrations.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return registrations.map((r: any) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{r.student ? `${r.student.first_name} ${r.student.last_name}` : '—'} · {r.course?.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(r.enrollment_date)}</span>
        </div>
      ));
    }
    if (selected === 'payments') {
      if (!payments || payments.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return payments.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{p.student ? `${p.student.first_name} ${p.student.last_name}` : '—'} · {p.payment_method}</span>
          <span className="text-sm font-semibold">{formatCurrency(p.amount ?? 0)}</span>
        </div>
      ));
    }
    if (selected === 'teacher_workload') {
      if (!teacherWorkload || teacherWorkload.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return teacherWorkload.map((r: any) => (
        <div key={r.teacher_id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{r.teacher_name ?? 'Enseignant'}</span>
          <span className="text-sm">{r.total_hours ?? 0}h / {r.course_count ?? 0} cours</span>
        </div>
      ));
    }
    return <p className="text-sm text-muted-foreground text-center py-8">{t('reports.select_type', lang)}</p>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.reports', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('reports.subtitle', lang)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportPDF('rapport')}><FileIcon className="h-4 w-4" />{t('common.export', lang)}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-2">
          {reportTypes.map(r => (
            <button
              key={r.id}
              className={`w-full text-left rounded-xl p-3 transition-colors ${selected === r.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
              onClick={() => setSelected(r.id)}
            >
              <div className="flex items-center gap-3">
                <r.icon className="h-4 w-4" />
                <span className="text-sm">{reportLabels[r.id]}</span>
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('reports.preview', lang)}</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => exportPDF('rapport')}><Download className="h-4 w-4" />{t('common.export', lang)}</Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}