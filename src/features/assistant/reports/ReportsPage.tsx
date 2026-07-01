import { useState } from 'react';
import { BarChart3, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';

const reportTypes = [
  { id: 'attendance', label: 'Rapport de présence', icon: BarChart3 },
  { id: 'revenue', label: 'Rapport financier', icon: FileText },
  { id: 'registrations', label: 'Rapport inscriptions', icon: FileText },
  { id: 'payments', label: 'Rapport paiements', icon: FileText },
  { id: 'teacher_workload', label: 'Charge enseignants', icon: BarChart3 },
] as const;

export default function ReportsPage() {
  const [selected, setSelected] = useState('revenue');
  const { data: revenue } = useQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-sm text-muted-foreground mt-1">Générer et exporter des rapports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" />Excel</Button>
          <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />PDF</Button>
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
                <span className="text-sm">{r.label}</span>
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Aperçu - 30 derniers jours</CardTitle>
              <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Exporter</Button>
            </div>
          </CardHeader>
          <CardContent>
            {selected === 'revenue' && (
              <div className="space-y-2">
                {(revenue ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible</p>
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
              <p className="text-sm text-muted-foreground text-center py-8">Sélectionnez un type de rapport</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}