import { UserPlus, BookOpen, FileText, BarChart3, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const actions: { icon: LucideIcon; label: string; path: string; desc: string }[] = [
  { icon: UserPlus, label: 'Nouvel élève', path: '/admin/users', desc: 'Ajouter un étudiant' },
  { icon: BookOpen, label: 'Nouveau cours', path: '/admin/courses', desc: 'Créer une session' },
  { icon: FileText, label: 'Facture', path: '/admin/invoices', desc: 'Générer une facture' },
  { icon: BarChart3, label: 'Rapport', path: '/admin/reports', desc: 'Analyses du centre' },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="h-2 w-2 rounded-full bg-accent/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map(a => (
            <Link
              key={a.path}
              to={a.path}
              className="group flex flex-col items-center gap-2 rounded-xl bg-primary/5 p-4 text-center transition-all duration-200 hover:bg-primary/10 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
