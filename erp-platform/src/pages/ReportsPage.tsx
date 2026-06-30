import { BarChart3, Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-page"><Download className="h-4 w-4" /> Exporter</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Revenus mensuels', desc: 'Analyse des revenus par mois', color: 'bg-green-500' },
          { title: 'Présences', desc: 'Taux de présence par cours', color: 'bg-notification0' },
          { title: 'Inscriptions', desc: 'Nouvelles inscriptions par période', color: 'bg-purple-500' },
          { title: 'Performance enseignants', desc: 'Évaluations et notes moyennes', color: 'bg-orange-500' },
          { title: 'Taux d\'occupation', desc: 'Utilisation des salles et cours', color: 'bg-cyan-500' },
          { title: 'Factures impayées', desc: 'Liste des impayés par mois', color: 'bg-red-500' },
        ].map((r) => (
          <div key={r.title} className="cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${r.color}`}><BarChart3 className="h-5 w-5 text-white" /></div>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-muted">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
