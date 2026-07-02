import { useState } from 'react';
import { Euro, TrendingUp, TrendingDown, Calendar, Download, Wallet, Banknote, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function RevenuePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: revenue, isLoading, isError } = useQuery({
    queryKey: ['teacher_revenue', profile?.id, period],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data: privateL, error: e1 } = await (supabase as any).from('private_lessons').select('price, date, status').eq('teacher_id', profile.id);
      if (e1) throw e1;
      const { data: vipL, error: e2 } = await (supabase as any).from('vip_classes').select('price, date, status').eq('teacher_id', profile.id);
      if (e2) throw e2;
      const { data: sessions, error: e3 } = await (supabase as any).from('course_schedules').select('course_id').eq('teacher_id', profile.id);
      if (e3) throw e3;
      const { data: payouts, error: e4 } = await (supabase as any).from('teacher_payroll').select('amount, status, paid_at').eq('teacher_id', profile.id);
      if (e4) throw e4;
      const completedPrivate = (privateL ?? []).filter((l: any) => l.status === 'completed');
      const completedVip = (vipL ?? []).filter((l: any) => l.status === 'completed');
      const totalPrivate = completedPrivate.reduce((s: number, l: any) => s + (l.price ?? 0), 0);
      const totalVip = completedVip.reduce((s: number, l: any) => s + (l.price ?? 0), 0);
      const lastPayout = (payouts ?? []).filter((p: any) => p.status === 'paid').sort((a: any, b: any) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())[0];
      return { totalPrivate, totalVip, totalRevenue: totalPrivate + totalVip, completedCount: completedPrivate.length + completedVip.length, lastPayout: lastPayout?.amount ?? 0, pendingPayouts: (payouts ?? []).filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount ?? 0), 0), sessions: (sessions ?? []).length };
    },
    enabled: !!profile?.id,
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">{'Revenus'}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">{t('errors.load_error', lang, '')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{'Revenus'}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <Button variant="outline" className="h-9 gap-2" onClick={() => {
          try {
            if (!revenue) { toast(t('common.error', lang), 'error'); return; }
            const csv = [
              'Description,Valeur',
              `${'Revenu total'},${revenue.totalRevenue} €`,
              `${t('status.pending', lang)},${revenue.pendingPayouts} €`,
              `${'Dernier paiement'},${revenue.lastPayout} €`,
              `${'Sessions'},${revenue.sessions}`,
              `${t('nav.private_lessons', lang)},${revenue.totalPrivate} €`,
              `${t('nav.vip_classes', lang)},${revenue.totalVip} €`,
              `${'Sessions complétées'},${revenue.completedCount}`,
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `revenus-${period}.csv`; a.click();
            URL.revokeObjectURL(url);
            toast(t('common.info', lang), 'info');
          } catch (err: any) {
            toast(err?.message ?? t('common.error', lang), 'error');
          }
        }}><Download className="h-4 w-4" />{'Relevé'}</Button>
      </div>
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map(p => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => setPeriod(p)}>
            {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Euro className="h-3.5 w-3.5" />{'Revenu total'}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-20 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{revenue?.totalRevenue ?? 0} €</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Banknote className="h-3.5 w-3.5" />{t('status.pending', lang)}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-20 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold text-amber-600">{revenue?.pendingPayouts ?? 0} €</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Wallet className="h-3.5 w-3.5" />{'Dernier paiement'}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-20 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{revenue?.lastPayout ?? 0} €</p>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Receipt className="h-3.5 w-3.5" />{'Sessions'}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="h-8 w-20 bg-muted rounded animate-pulse" /> : <p className="text-2xl font-bold">{revenue?.sessions ?? 0}</p>}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-sm">{'Détail des revenus'}</CardTitle></CardHeader><CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Euro className="h-4 w-4 text-primary" /></span><div><p className="text-sm font-medium">{t('nav.private_lessons', lang)}</p><p className="text-xs text-muted-foreground">{revenue?.completedCount ?? 0} sessions</p></div></div><p className="text-lg font-semibold">{revenue?.totalPrivate ?? 0} €</p></div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><Euro className="h-4 w-4 text-amber-600" /></span><div><p className="text-sm font-medium">{t('nav.vip_classes', lang)}</p><p className="text-xs text-muted-foreground">{'Premium'}</p></div></div><p className="text-lg font-semibold">{revenue?.totalVip ?? 0} €</p></div>
        </div>
      </CardContent></Card>
    </div>
  );
}
