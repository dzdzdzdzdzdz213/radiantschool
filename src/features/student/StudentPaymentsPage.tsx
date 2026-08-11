import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StudentTable = {
  id: string;
  users: { first_name: string; last_name: string };
};

export default function StudentPaymentsPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const isParent = profile?.role === 'parent';

  const { data: children } = useQuery({
    queryKey: ['payments-page-children', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: links } = await supabase
        .from('student_parent')
        .select('student_id, student:students!student_id(id, users:users!students_id_fkey(first_name, last_name))')
        .eq('parent_id', profile.id);
      return (links ?? []).map((l) => l.student).filter((s): s is StudentTable => !!s);
    },
    enabled: isParent && !!profile?.id,
  });

  const ids = isParent ? (children ?? []).map((c) => c.id) : (profile?.id ? [profile.id] : []);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments', ids.join(',')],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data } = await supabase
        .from('payments')
        .select('*, student:students!student_id(id, users:users!students_id_fkey(first_name, last_name))')
        .in('student_id', ids)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: ids.length > 0,
  });

  const total = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> {t('nav.payments', lang)}</h1>
      <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">{t('common.total', lang)}</p><p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p></CardContent></Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">{t('payments.history', lang)}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : !payments?.length ? (
            <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          ) : (
            payments.map((p) => {
              const student = p.student?.users;
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                  <div>
                    {(isParent && student) && (
                      <p className="text-xs font-medium text-muted-foreground">
                        {student.first_name} {student.last_name}
                      </p>
                    )}
                    <p className="font-semibold">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">{p.payment_method} · {formatDate(p.payment_date ?? p.created_at)}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">{t('status.paid', lang)}</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}