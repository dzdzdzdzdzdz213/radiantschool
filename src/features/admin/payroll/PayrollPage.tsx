import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, XCircle, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface PayrollEntry {
  id: number;
  teacher: { first_name: string; last_name: string } | null;
  month: number;
  year: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function PayrollPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-payroll', filter],
    queryFn: async () => {
      let q = supabase
        .from('teacher_payroll')
        .select('*, teacher:teachers!teacher_id(user:users(first_name, last_name))')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter === 'unpaid') q = q.neq('status', 'paid');
      else if (filter === 'paid') q = q.eq('status', 'paid');

      const { data } = await q;
      return ((data ?? []) as Array<Record<string, unknown> & { teacher?: { user?: { first_name: string; last_name: string } } | null }>)
        .map((r) => ({ ...r, teacher: r.teacher?.user ?? null })) as unknown as PayrollEntry[];
    },
    staleTime: 15_000,
  });

  const markPaid = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('teacher_payroll')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-payroll'] }),
    onError: (err) => toast(err?.message ?? t('errors.update_error', lang, 'la paie'), 'error'),
  });

  const paidCount = data?.filter(e => e.status === 'paid').length ?? 0;
  const totalNet = data?.reduce((s, e) => s + Number(e.net_pay), 0) ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Paie des enseignants</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilter('all')}>Tous</Button>
          <Button variant="outline" size="sm" onClick={() => setFilter('unpaid')}>Non payés</Button>
          <Button variant="outline" size="sm" onClick={() => setFilter('paid')}>Payés</Button>
          <Button variant="outline" size="sm" onClick={() => {
            if (!data) return;
            downloadCSV(data.map(e => ({
              enseignant: e.teacher ? `${e.teacher.first_name} ${e.teacher.last_name}` : '',
              mois: monthNames[e.month] || e.month,
              année: e.year,
              brut: e.gross_pay,
              déductions: e.deductions,
              net: e.net_pay,
              statut: e.status,
              payé_le: e.paid_at ? new Date(e.paid_at).toISOString().split('T')[0] : '',
            })), `paie-${(() => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })()}`);
          }}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Lignes affichées</p>
          <p className="text-2xl font-bold">{data?.length ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Payés (affichés)</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Net total (affiché)</p>
          <p className="text-2xl font-bold">{formatCurrency(totalNet)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : !data?.length ? (
            <div className="p-8 text-center text-muted-foreground">Aucune entrée de paie</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enseignant</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Période</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Brut</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Déductions</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(entry => (
                    <tr key={entry.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {entry.teacher ? `${entry.teacher.first_name} ${entry.teacher.last_name}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {monthNames[entry.month] || entry.month} {entry.year}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(entry.gross_pay)}</td>
                      <td className="px-4 py-3 text-right text-red-500">{formatCurrency(entry.deductions)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(entry.net_pay)}</td>
                      <td className="px-4 py-3 text-center">
                        {entry.status === 'paid' ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Payé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-200">
                            <XCircle className="h-3 w-3 mr-1" /> En attente
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.status !== 'paid' && (
                          <Button size="sm" variant="outline" onClick={() => markPaid.mutate(entry.id)} disabled={markPaid.isPending}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Marquer payé
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
