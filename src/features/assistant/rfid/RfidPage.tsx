import { useState } from 'react';
import { Activity, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function RfidPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [scanInput, setScanInput] = useState('');

  const { data: recentScans, isError: recentError } = useQuery({
    queryKey: ['assistant_rfid_recent'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('rfid_scans')
        .select('id, rfid_code, status, scanned_at, student:users!student_id(first_name, last_name)')
        .order('scanned_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: allScans, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ['assistant_rfid_history'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('rfid_scans')
        .select('id, rfid_code, status, scanned_at, student:users!student_id(first_name, last_name)')
        .order('scanned_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  useErrorToast(recentError, lang, t('rfid.recent_scans', lang));
  useErrorToast(historyError, lang, t('rfid.history', lang));

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data: student } = await (supabase as any)
        .from('students')
        .select('id')
        .eq('rfid_tag', code)
        .maybeSingle();
      const { error } = await (supabase as any).from('rfid_scans').insert({
        rfid_code: code,
        student_id: student?.id ?? null,
        scanned_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_rfid_recent'] });
      qc.invalidateQueries({ queryKey: ['assistant_rfid_history'] });
      toast(t('success.scanned', lang), 'success');
      setScanInput('');
    },
    onError: (err: any) => toast(err?.message ?? t('rfid.scan_error', lang), 'error'),
  });

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    if ('key' in e) {
      if (e.key !== 'Enter') return;
      const val = (e.target as HTMLInputElement).value;
      if (val.length >= 3) {
        scanMutation.mutate(val);
      }
    } else {
      setScanInput(e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.rfid', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('rfid.subtitle', lang)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t('rfid.live_scan', lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('rfid.scan_placeholder', lang)}
                value={scanInput}
                onChange={handleScan}
                onKeyDown={handleScan}
                className="h-12 pl-9 text-lg font-mono"
                autoFocus
              />
            </div>
            <div className="rounded-xl bg-accent/50 p-8 text-center">
              {scanMutation.isPending ? (
                <div className="flex items-center justify-center gap-2"><Activity className="h-5 w-5 animate-spin" /><p className="text-sm">{t('rfid.scanning', lang)}</p></div>
              ) : (
                <>
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">{t('rfid.waiting', lang)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('rfid.waiting_hint', lang)}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              {t('rfid.recent_scans', lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentScans ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('common.no_data', lang)}</p>
              ) : (recentScans ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                  <div>
                    <p className="text-sm font-medium">{s.student ? `${s.student.first_name} ${s.student.last_name}` : s.rfid_tag}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(s.scanned_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('rfid.history', lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.students', lang)}</TableHead>
                <TableHead>{t('common.time', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{[1, 2, 3].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              )) : (allScans ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              ) : (allScans ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.student ? `${s.student.first_name} ${s.student.last_name}` : s.rfid_tag}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(s.scanned_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
