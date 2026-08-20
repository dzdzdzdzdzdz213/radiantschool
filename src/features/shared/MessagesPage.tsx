import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMessages } from '@/hooks/useQueries';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { MessageSquare, Plus, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

interface Recipient { id: string; first_name: string; last_name: string; email: string; }

type Role = NonNullable<NonNullable<ReturnType<typeof useAuth>['profile']>['role']>;

function roleOf(profile: { role?: Role } | null): 'student' | 'teacher' | null {
  if (!profile) return null;
  if (profile.role === 'teacher') return 'student';
  if (profile.role === 'student') return 'teacher';
  return null;
}

export default function MessagesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: messages, isLoading } = useMessages();
  const [selectedMsg, setSelectedMsg] = useState<NonNullable<typeof messages>[number] | null>(null);
  const [reply, setReply] = useState('');

  const [composeOpen, setComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const debouncedSearch = useDebounce(userSearch, 300);

  const targetRole = roleOf(profile);

  const { data: userResults } = useQuery({
    queryKey: ['message_recipients', targetRole, debouncedSearch],
    queryFn: async () => {
      if (!targetRole) return [];
      let q = supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', targetRole)
        .eq('status', 'active')
        .limit(10);
      if (debouncedSearch) {
        q = q.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Recipient[];
    },
    enabled: !!targetRole && composeOpen,
    staleTime: 10_000,
  });

  const toId = searchParams.get('to');
  const toSubject = searchParams.get('subject') ?? '';

  const { data: toUser } = useQuery({
    queryKey: ['message_to_user', toId],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('id, first_name, last_name, email').eq('id', toId!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Recipient | null;
    },
    enabled: !!toId,
  });

  const draft: Recipient | null = toUser ?? null;

  const sendNewMutation = useMutation({
    mutationFn: async () => {
      if (!recipient || !profile?.id) return;
      if (!subject.trim()) throw new Error(t('messages.subject_required', lang));
      if (!body.trim()) throw new Error(t('messages.body_required', lang));
      const { error } = await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: recipient.id,
        subject: subject.trim(),
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      toast(t('success.sent', lang, 'Message'), 'success');
      setComposeOpen(false);
      setRecipient(null);
      setSubject('');
      setBody('');
      setUserSearch('');
    },
    onError: (err) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const sendDraftMutation = useMutation({
    mutationFn: async () => {
      if (!draft || !profile?.id) return;
      if (!body.trim()) throw new Error(t('messages.body_required', lang));
      const { error } = await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: draft.id,
        subject: toSubject || draft.email,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      toast(t('success.sent', lang, 'Message'), 'success');
      setReply('');
    },
    onError: (err) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMsg || !profile?.id) return;
      const receiverId = selectedMsg.sender_id === profile?.id ? selectedMsg.receiver_id : selectedMsg.sender_id;
      const { error } = await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: receiverId,
        subject: selectedMsg.subject,
        body: reply,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      toast(t('success.sent', lang, 'Message'), 'success');
      setReply('');
    },
    onError: (err) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!profile?.id) return;
      const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id).neq('sender_id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });

  const filtered = (messages ?? []).filter((m) => m.sender_id === profile?.id || m.receiver_id === profile?.id);
  const activeDraft = !selectedMsg && draft;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">{t('nav.messages', lang)}</h2>
          {targetRole && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setComposeOpen(true)}>
              <Plus className="h-3.5 w-3.5" />{t('messages.new', lang)}
            </Button>
          )}
        </div>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 57px)' }}>
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">{t('common.no_data', lang)}</p>
            </div>
          ) : (
            filtered.map((m) => {
              const isSent = m.sender_id === profile?.id;
              const other = isSent ? m.receiver : m.sender;
              return (
                <div
                  key={m.id}
                  className={`cursor-pointer border-b p-4 text-sm hover:bg-page ${!m.is_read && !isSent ? 'bg-notification' : ''}`}
                  onClick={() => { setSelectedMsg(m); setReply(''); if (!m.is_read && !isSent) markReadMutation.mutate(m.id); }}
                >
                  <p className="font-medium">{other ? getFullName(other.first_name, other.last_name) : t('common.not_found', lang)}</p>
                  <p className="truncate text-muted-foreground">{m.subject || t('common.no_data', lang)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 rounded-xl border bg-card shadow-sm">
        {activeDraft ? (
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h3 className="font-semibold">{t('messages.new', lang)} — {getFullName(draft.first_name, draft.last_name)}</h3>
              <p className="text-sm text-muted-foreground">{draft.email}</p>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label>{t('messages.subject', lang)}</Label>
                <Input value={toSubject} readOnly />
              </div>
              <div className="space-y-2">
                <Label>{t('messages.body', lang)}</Label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="border-t p-4">
              <Button onClick={() => sendDraftMutation.mutate()} disabled={sendDraftMutation.isPending || !body.trim()} className="gap-2">
                <Send className="h-4 w-4" />{t('messages.send', lang)}
              </Button>
            </div>
          </div>
        ) : selectedMsg ? (
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h3 className="font-semibold">{selectedMsg.subject || t('common.no_data', lang)}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedMsg.sender_id === profile?.id ? t('messages.you', lang) : getFullName(selectedMsg.sender?.first_name || '', selectedMsg.sender?.last_name || '')}
                {' · '}{formatDateTime(selectedMsg.created_at)}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm">{selectedMsg.body}</p>
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t('messages.write_placeholder', lang)} className="flex-1" />
                <Button variant="default" onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !reply.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-12 w-12" />
              <p>{t('common.select', lang)}</p>
            </div>
          </div>
        )}
      </div>

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setComposeOpen(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('messages.new', lang)}</CardTitle>
              <button onClick={() => setComposeOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('messages.recipient', lang)}</Label>
                {recipient ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium truncate">{getFullName(recipient.first_name, recipient.last_name)} <span className="text-muted-foreground">· {recipient.email}</span></span>
                    <button onClick={() => setRecipient(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder={t('common.search', lang)} autoFocus />
                    {(userResults ?? []).length > 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                        {userResults!.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => { setRecipient(u); setUserSearch(''); }}
                          >
                            <span className="font-medium truncate">{getFullName(u.first_name, u.last_name)}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[40%]">{u.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('messages.subject', lang)}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('messages.body', lang)}</Label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => sendNewMutation.mutate()} disabled={sendNewMutation.isPending || !recipient}>
                  {sendNewMutation.isPending ? t('common.loading', lang) : t('messages.send', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}