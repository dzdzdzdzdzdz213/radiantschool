import { useState } from 'react';
import { Bell, Send, Plus } from 'lucide-react';
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

export default function NotificationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { data: notifications } = useQuery({
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

  const sendMutation = useMutation({
    mutationFn: async () => {
      return api.rpc('dispatch_notification', { title, message, type: 'announcement', category: 'general' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_notifications'] });
      setTitle(''); setMessage(''); setShowForm(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Envoyer et gérer les notifications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />Nouvelle notification
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Envoyer une notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} rows={4} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={() => sendMutation.mutate()} disabled={!title || !message}>
                <Send className="h-4 w-4 mr-2" />Envoyer
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
                <TableHead>Titre</TableHead>
                <TableHead className="hidden sm:table-cell">Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Lu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(notifications ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune notification</TableCell></TableRow>
              ) : (
                (notifications ?? []).map((n: any) => (
                  <TableRow key={n.id}>
                    <TableCell><span className="text-sm font-medium">{n.title}</span></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{n.message}</TableCell>
                    <TableCell><Badge variant="outline">{n.type}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateTime(n.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs ${n.is_read ? 'text-muted-foreground' : 'text-primary font-medium'}`}>
                        {n.is_read ? 'Lu' : 'Nouveau'}
                      </span>
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