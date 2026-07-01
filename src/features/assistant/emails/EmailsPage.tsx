import { useState, useEffect } from 'react';
import { Send, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function EmailsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const { data: sentEmails, isLoading: emailsLoading, isError: emailsError } = useQuery({
    queryKey: ['assistant_sent_emails'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('type', 'email')
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (emailsError) toast('Erreur lors du chargement des emails', 'error');
  }, [emailsError]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('notifications').insert({
        user_id: null,
        recipient: to,
        title: subject,
        message: body,
        type: 'email',
        category: 'email',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_sent_emails'] });
      toast('Email envoyé', 'success');
      setTo(''); setSubject(''); setBody(''); setShowComposer(false);
    },
    onError: (err: any) => toast(err?.message ?? 'Erreur lors de l\'envoi', 'error'),
  });

  const templates = [
    { id: '1', name: 'Rappel de paiement', subject: 'Rappel : Facture en attente' },
    { id: '2', name: 'Confirmation inscription', subject: 'Inscription confirmée' },
    { id: '3', name: 'Absence signalée', subject: 'Absence de votre enfant' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emails</h1>
          <p className="text-sm text-muted-foreground mt-1">Envoyer des emails et gérer les modèles</p>
        </div>
        <Button onClick={() => setShowComposer(!showComposer)} className="gap-2">
          <Plus className="h-4 w-4" />Nouvel email
        </Button>
      </div>

      {showComposer && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Composer un email</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Destinataire(s)" value={to} onChange={e => setTo(e.target.value)} />
            <Input placeholder="Sujet" value={subject} onChange={e => setSubject(e.target.value)} />
            <Textarea placeholder="Corps du message..." value={body} onChange={e => setBody(e.target.value)} rows={8} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposer(false)}>Annuler</Button>
              <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !subject || !body}>
                <Send className="h-4 w-4 mr-2" />{sendMutation.isPending ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Modèles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templates.map(t => (
              <button
                key={t.id}
                className="w-full text-left rounded-xl bg-accent/50 p-3 hover:bg-accent transition-colors"
                onClick={() => { setSubject(t.subject); setShowComposer(true); }}
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.subject}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Emails envoyés</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailsLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                )) : (sentEmails ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun email envoyé</TableCell></TableRow>
                ) : (sentEmails ?? []).map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{e.recipient ?? '—'}</TableCell>
                    <TableCell className="text-sm">{e.title ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(e.created_at)}</TableCell>
                    <TableCell className="text-right"><Badge variant="outline">Envoyé</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
