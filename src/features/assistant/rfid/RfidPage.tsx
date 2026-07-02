import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function RfidPage() {
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

  useEffect(() => {
    if (recentError) toast('Erreur lors du chargement des scans récents', 'error');
  }, [recentError]);

  useEffect(() => {
    if (historyError) toast('Erreur lors du chargement de l\'historique', 'error');
  }, [historyError]);

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data: student } = await (supabase as any)
        .from('students')
        .select('id')
        .eq('rfid_tag', code)
        .single();
      const { error } = await (supabase as any).from('rfid_scans').insert({
        rfid_code: code,
        student_id: student?.id ?? null,
        status: student?.id ? 'success' : 'unknown',
        scanned_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_rfid_recent'] });
      qc.invalidateQueries({ queryKey: ['assistant_rfid_history'] });
      toast('Scan enregistré', 'success');
      setScanInput('');
    },
    onError: (err: any) => toast(err?.message ?? 'Erreur lors du scan', 'error'),
  });

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setScanInput(val);
    if (val.length >= 6) {
      scanMutation.mutate(val);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scanner RFID</h1>
        <p className="text-sm text-muted-foreground mt-1">Scanner les badges RFID et suivre les entrées/sorties</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Scan en direct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scanner un badge ou entrer un code RFID..."
                value={scanInput}
                onChange={handleScan}
                className="h-12 pl-9 text-lg font-mono"
                autoFocus
              />
            </div>
            <div className="rounded-xl bg-accent/50 p-8 text-center">
              {scanMutation.isPending ? (
                <div className="flex items-center justify-center gap-2"><Activity className="h-5 w-5 animate-spin" /><p className="text-sm">Scan en cours...</p></div>
              ) : (
                <>
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">En attente de scan...</p>
                  <p className="text-xs text-muted-foreground mt-1">Scannez un badge RFID ou saisissez le code manuellement</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Derniers scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentScans ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun scan récent</p>
              ) : (recentScans ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                  <div>
                    <p className="text-sm font-medium">{s.student ? `${s.student.first_name} ${s.student.last_name}` : s.rfid_code}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(s.scanned_at)}</p>
                  </div>
                  <Badge variant={s.status === 'success' ? 'success' : 'destructive'}>
                    {s.status === 'success' ? 'OK' : 'Échec'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Historique des scans aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{[1, 2, 3].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              )) : (allScans ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucun scan aujourd'hui</TableCell></TableRow>
              ) : (allScans ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.student ? `${s.student.first_name} ${s.student.last_name}` : s.rfid_code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(s.scanned_at)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'success' ? 'success' : 'destructive'}>
                      {s.status === 'success' ? 'Succès' : 'Échec'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
