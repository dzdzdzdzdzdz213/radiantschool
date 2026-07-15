import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Users, DollarSign, Bell, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, getFullName } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

function PageHeader({ name }: { name: string }) {
  const { lang } = useLang();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ' };
  const today = new Date().toLocaleDateString(localeMap[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-radial from-primary/[0.06] to-transparent" />
        </div>
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('dashboard.greeting', lang, name)}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: children } = useQuery({
    queryKey: ['parent-children', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: links } = await supabase
        .from('student_parent')
        .select('student:students!student_id(user:users!students_id_fkey(id, first_name, last_name, photo_url))')
        .eq('parent_id', profile.id);
      return (links ?? []).map((l: any) => l.student?.user).filter(Boolean);
    },
    enabled: !!profile?.id,
  });

  const childIds = (children ?? []).map(c => c.id);

  const { data: stats } = useQuery({
    queryKey: ['parent-stats', childIds.join(',')],
    queryFn: async () => {
      if (!childIds.length) return { enrollments: 0, payments: 0, totalPaid: 0 };
      const [enr, pay] = await Promise.all([
        supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).in('student_id', childIds),
        supabase.from('payments').select('amount').in('student_id', childIds).is('deleted_at', null),
      ]);
      return { enrollments: enr.count ?? 0, payments: (pay.data ?? []).length, totalPaid: (pay.data ?? []).reduce((s, p: any) => s + Number(p.amount), 0) };
    },
    enabled: childIds.length > 0,
  });

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader name={profile?.firstName ?? ''} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mes enfants</p>
              <p className="text-2xl font-bold">{children?.length ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.registrations', lang)}</p>
              <p className="text-2xl font-bold">{stats?.enrollments ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.payments', lang)}</p>
              <p className="text-2xl font-bold">{stats ? formatCurrency(stats.totalPaid) : '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('nav.announcements', lang)}</p>
              <p className="text-2xl font-bold">{stats?.payments ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {children && children.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Mes enfants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {children.map((child: any) => (
              <Link key={child.id} to={`/parent/profile`} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {child.first_name?.charAt(0)}{child.last_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{getFullName(child.first_name, child.last_name)}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
