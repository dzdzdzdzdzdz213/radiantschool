import { BarChart3, Download } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const REPORT_LINKS: Record<string, string> = {
  'Revenus mensuels': '/admin/payments',
  'Présences': '/admin/attendance',
  'Inscriptions': '/admin/users',
  'Performance enseignants': '/admin/users',
  "Taux d'occupation": '/admin/courses',
  'Factures impayées': '/admin/invoices',
};

export default function ReportsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleExportCSV = async () => {
    try {
      toast('Génération du CSV...', 'info');
      const { data } = await (supabase as any)
        .from('payments')
        .select('receipt_number, amount, payment_method, payment_type, created_at, student:users(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (!data || data.length === 0) {
        toast('Aucune donnée à exporter', 'warning');
        return;
      }
      const headers = 'Reçu,Élève,Montant,Méthode,Type,Date\n';
      const rows = data.map((p: any) =>
        `"${p.receipt_number}","${p.student?.first_name ?? ''} ${p.student?.last_name ?? ''}",${p.amount},"${p.payment_method}","${p.payment_type}","${p.created_at}"`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-paiements-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast('CSV exporté', 'success');
    } catch (err: any) {
      toast(err?.message ?? 'Erreur d\'export', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-page" onClick={handleExportCSV}><Download className="h-4 w-4" /> Exporter</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Revenus mensuels', desc: 'Analyse des revenus par mois', color: 'bg-green-500' },
          { title: 'Présences', desc: 'Taux de présence par cours', color: 'bg-cyan-500' },
          { title: 'Inscriptions', desc: 'Nouvelles inscriptions par période', color: 'bg-purple-500' },
          { title: 'Performance enseignants', desc: 'Évaluations et notes moyennes', color: 'bg-orange-500' },
          { title: "Taux d'occupation", desc: 'Utilisation des salles et cours', color: 'bg-cyan-500' },
          { title: 'Factures impayées', desc: 'Liste des impayés par mois', color: 'bg-red-500' },
        ].map((r) => (
          <div
            key={r.title}
            className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => navigate(REPORT_LINKS[r.title] || '/admin')}
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${r.color}`}><BarChart3 className="h-5 w-5 text-white" /></div>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-muted">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
