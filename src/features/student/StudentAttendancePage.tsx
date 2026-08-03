import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentAttendancePage() {
  const { profile } = useAuth();
  const { lang } = useLang();

  const { data: records, isLoading } = useQuery({
    queryKey: ['student-attendance', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('attendance_records')
        .select('id, status, session:attendance_sessions!session_id(date, course:courses(name))')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const present = records?.filter(r => r.status === 'present').length ?? 0;
  const late = records?.filter(r => r.status === 'late').length ?? 0;
  const absent = records?.filter(r => r.status === 'absent').length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6" /> {t('nav.attendance', lang)}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-green-600">{present}</p><p className="text-sm text-muted-foreground mt-1">Présent</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-amber-600">{late}</p><p className="text-sm text-muted-foreground mt-1">Retard</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-red-600">{absent}</p><p className="text-sm text-muted-foreground mt-1">Absent</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Historique</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : !records?.length ? (
            <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>
          ) : (
            records.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <span>{r.session?.course?.name} — {r.session?.date}</span>
                <span className={`font-semibold ${r.status === 'present' ? 'text-green-600' : r.status === 'late' ? 'text-amber-600' : 'text-red-600'}`}>{r.status}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
