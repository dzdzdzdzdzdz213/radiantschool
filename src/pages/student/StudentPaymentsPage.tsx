import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentPaymentsPage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['student-payments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', profile.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const total = (payments ?? []).reduce((s, p: any) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> {t('nav.payments', lang)}</h1>
      <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">{t('common.total', lang)}</p><p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p></CardContent></Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Historique</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : !payments?.length ? (
            <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          ) : (
            payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <div>
                  <p className="font-semibold">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{p.payment_method} · {formatDate(p.created_at)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
