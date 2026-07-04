import { useState } from 'react';
import { BarChart3, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
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
  const { toast } = useToast();
  const reportLabels: Record<string, string> = {
    attendance: t('reports.attendance', lang),
    revenue: t('reports.revenue', lang),
    registrations: t('reports.registrations', lang),
    payments: t('reports.payments', lang),
    teacher_workload: t('reports.teacher_workload', lang),
  };
  const [selected, setSelected] = useState('revenue');
  const { data: revenue, isLoading, isError } = useQuery({
    queryKey: ['assistant_report_revenue'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('v_daily_revenue')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  useErrorToast(isError, lang, t('reports.data', lang));

  const exportCSV = (filename: string) => {
    if (!revenue || revenue.length === 0) {
      toast(t('common.no_data', lang), 'error');
      return;
    }
    const headers = ['Date', 'Revenu'];
    const rows = revenue.map((r: any) => [r.date ?? '', r.total_revenue ?? 0]);
    const csv = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t('reports.export_success', lang), 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.reports', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('reports.subtitle', lang)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportCSV('rapport-financier')}><FileSpreadsheet className="h-4 w-4" />{t('reports.export_excel', lang)}</Button>
          <Button variant="outline" className="gap-2" onClick={() => exportCSV('rapport-financier')}><FileText className="h-4 w-4" />CSV</Button>
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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV('rapport-financier')}><Download className="h-4 w-4" />{t('common.export', lang)}</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
            ) : selected === 'revenue' && (
              <div className="space-y-2">
                {(revenue ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>
                ) : (
                  (revenue ?? []).slice(0, 10).map((r: any) => (
                    <div key={r.date} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                      <span className="text-sm">{formatDate(r.date)}</span>
                      <span className="text-sm font-semibold">{formatCurrency(r.total_revenue ?? 0)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
            {selected !== 'revenue' && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('reports.select_type', lang)}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
