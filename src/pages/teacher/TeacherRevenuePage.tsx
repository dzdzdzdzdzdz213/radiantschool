import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherRevenuePage() {
  const { profile } = useAuth();

  const { data: payroll, isLoading: plLoading } = useQuery({
    queryKey: ['teacher-payroll', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('teacher_payroll')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: payments, isLoading: pmLoading } = useQuery({
    queryKey: ['teacher-payments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data: courseIds } = await supabase.from('courses').select('id').eq('teacher_id', profile.id);
      if (!courseIds?.length) return [];
      const { data: studentIds } = await supabase.from('course_enrollments').select('student_id').in('course_id', courseIds.map(c => c.id));
      if (!studentIds?.length) return [];
      const { data } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_type, student:students!student_id(user:users!id(first_name, last_name))')
        .in('student_id', [...new Set(studentIds.map(s => s.student_id))])
        .is('deleted_at', null)
        .order('payment_date', { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const totalPayroll = payroll?.reduce((s: number, p: any) => s + Number(p.net_pay), 0) ?? 0;
  const totalPayments = payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;

  const isLoading = plLoading || pmLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" />Revenus</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total payé</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{isLoading ? '...' : totalPayroll.toLocaleString()} DA</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Paiements des étudiants</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{isLoading ? '...' : totalPayments.toLocaleString()} DA</p></CardContent>
        </Card>
      </div>

      {payroll && payroll.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Historique des paiements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {payroll.map((p: any) => {
              const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">{months[p.month - 1]} {p.year}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                  </div>
                  <p className="text-lg font-bold">{Number(p.net_pay).toLocaleString()} DA</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
