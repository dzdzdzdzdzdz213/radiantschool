import { UserPlus, BookOpen, FileText, BarChart3, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function QuickActions() {
  const { lang } = useLang();
  const actions: { icon: LucideIcon; label: string; path: string; desc: string }[] = [
    { icon: UserPlus, label: t('common.new', lang) + ' ' + t('role.student', lang), path: '/admin/users', desc: t('common.add', lang) + ' ' + t('role.student', lang) },
    { icon: BookOpen, label: t('common.new', lang) + ' ' + t('nav.courses', lang), path: '/admin/courses', desc: t('common.create', lang) + ' session' },
    { icon: FileText, label: t('nav.invoices', lang), path: '/admin/invoices', desc: t('common.create', lang) + ' ' + t('nav.invoices', lang) },
    { icon: BarChart3, label: t('nav.reports', lang), path: '/admin/reports', desc: t('common.details', lang) + ' ' + t('nav.dashboard', lang) },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">{t('dashboard.quick_actions', lang)}</CardTitle>
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
