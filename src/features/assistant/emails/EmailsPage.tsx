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
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function EmailsPage() {
  const { lang } = useLang();
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
    if (emailsError) toast(t('errors.load_error', lang, t('nav.emails', lang)), 'error');
  }, [emailsError]);

  const templates = [
    { id: '1', name: t('emails.template_payment_reminder', lang), subject: t('emails.template_payment_subject', lang) },
    { id: '2', name: t('emails.template_registration', lang), subject: t('emails.template_registration_subject', lang) },
    { id: '3', name: t('emails.template_absence', lang), subject: t('emails.template_absence_subject', lang) },
  ];

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
      toast(t('success.sent', lang, t('nav.emails', lang)), 'success');
      setTo(''); setSubject(''); setBody(''); setShowComposer(false);
    },
    onError: (err: any) => toast(err?.message ?? t('errors.send_error', lang, t('nav.emails', lang)), 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.emails', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('emails.subtitle', lang)}</p>
        </div>
        <Button onClick={() => setShowComposer(!showComposer)} className="gap-2">
          <Plus className="h-4 w-4" />{t('emails.new', lang)}
        </Button>
      </div>

      {showComposer && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('emails.compose', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder={t('emails.recipients_placeholder', lang)} value={to} onChange={e => setTo(e.target.value)} />
            <Input placeholder={t('emails.subject_placeholder', lang)} value={subject} onChange={e => setSubject(e.target.value)} />
            <Textarea placeholder={t('emails.body_placeholder', lang)} value={body} onChange={e => setBody(e.target.value)} rows={8} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposer(false)}>{t('common.cancel', lang)}</Button>
              <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !subject || !body}>
                <Send className="h-4 w-4 mr-2" />{sendMutation.isPending ? t('common.loading', lang) : t('common.send', lang)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">{t('emails.templates', lang)}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-sm">{t('emails.sent', lang)}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('emails.recipient', lang)}</TableHead>
                  <TableHead>{t('emails.subject', lang)}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('common.date', lang)}</TableHead>
                  <TableHead className="text-right">{t('common.status', lang)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailsLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{[1, 2, 3, 4].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
                )) : (sentEmails ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
                ) : (sentEmails ?? []).map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{e.recipient ?? '—'}</TableCell>
                    <TableCell className="text-sm">{e.title ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(e.created_at)}</TableCell>
                    <TableCell className="text-right"><Badge variant="outline">{t('common.success', lang)}</Badge></TableCell>
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
