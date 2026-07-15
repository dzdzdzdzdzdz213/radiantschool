import { useState } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useErrorToast } from '@/hooks/useErrorToast';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function NotificationsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['assistant_notifications'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });
  useErrorToast(isError, lang, t('nav.notifications', lang));

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from('notifications').insert({ user_id: null, title, message, type: 'announcement', is_read: false, created_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_notifications'] });
      setTitle(''); setMessage(''); setShowForm(false);
      toast(t('success.sent', lang, t('nav.notifications', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('errors.send_error', lang, t('nav.notifications', lang)), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_notifications'] });
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.notifications', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('notifications.subtitle', lang)}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />{t('notifications.new', lang)}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('notifications.send', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder={t('notifications.title_placeholder', lang)} value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder={t('notifications.message_placeholder', lang)} value={message} onChange={e => setMessage(e.target.value)} rows={4} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel', lang)}</Button>
              <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !title || !message}>
                <Send className="h-4 w-4 mr-2" />{sendMutation.isPending ? t('common.loading', lang) : t('common.send', lang)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('notifications.title', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.message', lang)}</TableHead>
                <TableHead>{t('common.type', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="text-right">{t('notifications.read', lang)}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{[1, 2, 3, 4, 5, 6].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              )) : (notifications ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              ) : (
                (notifications ?? []).map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell><span className="text-sm font-medium">{n.title}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{n.message}</TableCell>
                    <TableCell><Badge variant="outline">{n.type}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(n.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs ${n.is_read ? 'text-muted-foreground' : 'text-primary font-medium'}`}>
                        {n.is_read ? t('notifications.read', lang) : t('common.new', lang)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: n.id, name: n.title })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
