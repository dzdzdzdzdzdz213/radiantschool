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
import { downloadCSV } from '@/lib/csv';

const reportTypes = [
  { id: 'attendance', label: '', icon: BarChart3 },
  { id: 'revenue', label: '', icon: FileText },
  { id: 'registrations', label: '', icon: FileText },
  { id: 'payments', label: '', icon: FileText },
  { id: 'teacher_workload', label: '', icon: BarChart3 },
] as const;

export default function ReportsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const reportLabels: Record<string, string> = {
    attendance: t('reports.attendance', lang),
    revenue: t('reports.revenue', lang),
    registrations: t('reports.registrations', lang),
    payments: t('reports.payments', lang),
    teacher_workload: t('reports.teacher_workload', lang),
  };
  const [selected, setSelected] = useState('revenue');

  const { data: revenue, isLoading: revenueLoading, isError: revenueError } = useQuery({
    queryKey: ['assistant_report_revenue'],
    enabled: selected === 'revenue',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_daily_revenue').select('*').order('date', { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: attendance, isLoading: attendanceLoading, isError: attendanceError } = useQuery({
    queryKey: ['assistant_report_attendance'],
    enabled: selected === 'attendance',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_daily_attendance').select('*').order('date', { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: registrations, isLoading: registrationsLoading, isError: registrationsError } = useQuery({
    queryKey: ['assistant_report_registrations'],
    enabled: selected === 'registrations',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments').select('id, enrollment_date, course:courses(name), student:students!student_id(user:users!students_id_fkey(first_name, last_name))').order('enrollment_date', { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: payments, isLoading: paymentsLoading, isError: paymentsError } = useQuery({
    queryKey: ['assistant_report_payments'],
    enabled: selected === 'payments',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments').select('id, amount, payment_method, created_at, student:students!student_id(user:users!students_id_fkey(first_name, last_name))').order('created_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: teacherWorkload, isLoading: workloadLoading, isError: workloadError } = useQuery({
    queryKey: ['assistant_report_teacher_workload'],
    enabled: selected === 'teacher_workload',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_teacher_workload').select('*').order('total_hours', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = revenueLoading || attendanceLoading || registrationsLoading || paymentsLoading || workloadLoading;
  const isError = revenueError || attendanceError || registrationsError || paymentsError || workloadError;

  useErrorToast(isError, lang, t('reports.data', lang));

  const exportCSV = () => {
    let rows: Record<string, unknown>[] = [];
    if (selected === 'revenue') rows = (revenue ?? []).map((r) => ({ date: r.date, amount: r.amount }));
    else if (selected === 'attendance') rows = (attendance ?? []).map((r) => ({ date: r.date, present: r.present_count, total: r.total_count }));
    else if (selected === 'registrations') rows = (registrations ?? []).map((r) => ({ student: r.student?.user ? `${r.student.user.first_name} ${r.student.user.last_name}` : '', course: r.course?.name ?? '', date: r.enrollment_date }));
    else if (selected === 'payments') rows = (payments ?? []).map((p) => ({ student: p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : '', method: p.payment_method, amount: p.amount, date: p.created_at }));
    else if (selected === 'teacher_workload') rows = (teacherWorkload ?? []).map((r) => ({ teacher: r.teacher_name, hours: r.total_hours, courses: r.course_count }));

    if (!rows.length) {
      toast(t('common.no_data', lang), 'error');
      return;
    }
    const now = new Date();
    downloadCSV(rows, `rapport_${selected}_${new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]}`);
    toast(t('reports.export_success', lang), 'success');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>;
    }
    if (isError) {
      return <p className="text-sm text-red-500 text-center py-8">Erreur lors du chargement des données</p>;
    }
    if (selected === 'revenue') {
      if (!revenue || revenue.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return revenue.slice(0, 10).map((r) => (
        <div key={r.date} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{formatDate(r.date ?? '')}</span>
          <span className="text-sm font-semibold">{formatCurrency(r.amount ?? 0)}</span>
        </div>
      ));
    }
    if (selected === 'attendance') {
      if (!attendance || attendance.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return attendance.slice(0, 10).map((r) => (
        <div key={r.date} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{formatDate(r.date ?? '')}</span>
          <span className="text-sm">{r.present_count ?? 0} présentes / {r.total_count ?? 0}</span>
        </div>
      ));
    }
    if (selected === 'registrations') {
      if (!registrations || registrations.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return registrations.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{r.student?.user ? `${r.student.user.first_name} ${r.student.user.last_name}` : '—'} · {r.course?.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(r.enrollment_date)}</span>
        </div>
      ));
    }
    if (selected === 'payments') {
      if (!payments || payments.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return payments.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
          <span className="text-sm">{p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : '—'} · {p.payment_method}</span>
          <span className="text-sm font-semibold">{formatCurrency(p.amount ?? 0)}</span>
        </div>
      ));
    }
    if (selected === 'teacher_workload') {
      if (!teacherWorkload || teacherWorkload.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>;
      return teacherWorkload.map((r) => (
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
          <Button variant="outline" className="gap-2" onClick={exportCSV}><FileIcon className="h-4 w-4" />{t('common.export', lang)}</Button>
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
              <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" />{t('common.export', lang)}</Button>
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