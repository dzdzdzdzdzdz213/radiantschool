import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime, getFullName, getInitials } from '@/lib/utils';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';

interface UserBrief { id: string; first_name: string; last_name: string; email: string; }
interface ChatMessage {
  id: number;
  conversation_id: number | null;
  sender_id: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
interface Conversation {
  id: number;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
}

const otherOf = (c: Conversation, me: string | undefined) => (c.user1_id === me ? c.user2_id : c.user1_id);

function roleOf(profile: { role?: string } | null): 'student' | 'teacher' | null {
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
  const me = profile?.id;
  const bottomRef = useRef<HTMLDivElement>(null);

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');

  const [composeOpen, setComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState<UserBrief | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const debouncedSearch = useDebounce(userSearch, 300);
  const targetRole = roleOf(profile);

  const { data: conversations = [], isLoading: convLoading } = useQuery({
    queryKey: ['chats', me],
    queryFn: async () => {
      if (!me) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${me},user2_id.eq.${me}`)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
    enabled: !!me,
    staleTime: 5_000,
  });

  const otherIds = conversations.map((c) => otherOf(c, me)).filter(Boolean);

  const { data: usersById = {} as Record<string, UserBrief> } = useQuery({
    queryKey: ['chat_users', otherIds.join(',')],
    queryFn: async () => {
      if (otherIds.length === 0) return {} as Record<string, UserBrief>;
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', otherIds);
      if (error) throw error;
      return Object.fromEntries(((data ?? []) as UserBrief[]).map((u) => [u.id, u]));
    },
    enabled: otherIds.length > 0,
    staleTime: 60_000,
  });

  const convIds = conversations.map((c) => c.id);

  const { data: allMessages = [] as ChatMessage[] } = useQuery({
    queryKey: ['chat_messages', convIds.join(',')],
    queryFn: async () => {
      if (convIds.length === 0) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, receiver_id, body, is_read, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
    enabled: convIds.length > 0,
    staleTime: 5_000,
  });

  const byConv = (id: number | null) => (id === null ? [] : allMessages.filter((m) => m.conversation_id === id));
  const thread = activeConvId === null ? [] : byConv(activeConvId);
  const unreadOf = (c: Conversation) => allMessages.filter((m) => m.conversation_id === c.id && m.receiver_id === me && !m.is_read).length;
  const lastOf = (c: Conversation) => [...byConv(c.id)].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).pop();

  const { data: toUser } = useQuery({
    queryKey: ['chat_to_user', searchParams.get('to')],
    queryFn: async () => {
      const to = searchParams.get('to');
      if (!to) return null;
      const { data, error } = await supabase.from('users').select('id, first_name, last_name, email').eq('id', to).maybeSingle();
      if (error) throw error;
      return (data ?? null) as UserBrief | null;
    },
    enabled: !!searchParams.get('to'),
  });

  const openConversation = useMutation({
    mutationFn: async (otherId: string) => {
      if (!me) throw new Error('auth required');
      const { data, error } = await supabase.rpc('get_or_create_conversation', { p_other: otherId });
      if (error) throw error;
      return Number(data);
    },
    onSuccess: (cid) => {
      setActiveConvId(cid);
      qc.invalidateQueries({ queryKey: ['chats'] });
      setComposeOpen(false);
      setRecipient(null);
      setUserSearch('');
    },
    onError: (err) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!me || activeConvId === null) return;
      const conv = conversations.find((c) => c.id === activeConvId);
      if (!conv) return;
      const other = otherOf(conv, me);
      if (!draftText.trim()) return;
      const { error } = await supabase.from('messages').insert({
        sender_id: me,
        receiver_id: other,
        conversation_id: activeConvId,
        subject: null,
        body: draftText.trim(),
      });
      if (error) throw error;
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat_messages'] });
      qc.invalidateQueries({ queryKey: ['chats'] });
      setDraftText('');
    },
    onError: (err) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  const markReadMutation = useMutation({
    mutationFn: async (convId: number) => {
      if (!me) return;
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .eq('receiver_id', me)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat_messages'] });
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  useEffect(() => {
    const to = searchParams.get('to');
    if (to && me && toUser && activeConvId === null) {
      const existing = conversations.find((c) => otherOf(c, me) === to);
      if (existing) {
        setActiveConvId(existing.id);
      } else {
        openConversation.mutate(to);
      }
    }
  }, [toUser, me, activeConvId, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeConvId !== null && me) {
      markReadMutation.mutate(activeConvId);
    }
  }, [activeConvId, allMessages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, activeConvId]);

  const { data: userResults = [] as UserBrief[] } = useQuery({
    queryKey: ['chat_recipients', targetRole, debouncedSearch],
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
      return (data ?? []) as UserBrief[];
    },
    enabled: !!targetRole && composeOpen,
    staleTime: 10_000,
  });

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeOtherId = activeConv ? otherOf(activeConv, me) : null;
  const activeOther = activeOtherId ? usersById[activeOtherId] : null;
  const activeThread = activeConvId === null ? [] : byConv(activeConvId);

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
          {convLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">{t('common.no_data', lang)}</p>
            </div>
          ) : (
            conversations.map((c) => {
              const oid = otherOf(c, me);
              const other = usersById[oid];
              const unread = unreadOf(c);
              const last = lastOf(c);
              return (
                <div
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-3 border-b p-3 hover:bg-page ${activeConvId === c.id ? 'bg-muted/60' : ''}`}
                  onClick={() => setActiveConvId(c.id)}
                >
                  <Avatar className="h-10 w-10 rounded-full bg-primary/10">
                    <AvatarFallback className="text-xs font-bold text-primary">
                      {other ? getInitials(other.first_name, other.last_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{other ? getFullName(other.first_name, other.last_name) : t('common.not_found', lang)}</p>
                      {last && <span className="shrink-0 text-[10px] text-muted-foreground">{formatDateTime(last.created_at)}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">{last ? (last.sender_id === me ? 'Vous : ' : '') + last.body : '—'}</p>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">{unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border bg-card shadow-sm">
        {activeConv && activeOther ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <Avatar className="h-9 w-9 rounded-full bg-primary/10">
                <AvatarFallback className="text-xs font-bold text-primary">{getInitials(activeOther.first_name, activeOther.last_name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{getFullName(activeOther.first_name, activeOther.last_name)}</h3>
                <p className="text-xs text-muted-foreground">{activeOther.email}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {activeThread.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">{t('messages.start_chat', lang)}</p>
              ) : (
                activeThread.map((m) => {
                  const mine = m.sender_id === me;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted'}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-0.5 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatDateTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMutation.mutate(); } }}
                  placeholder={t('messages.write_placeholder', lang)}
                  className="flex-1"
                />
                <Button variant="default" onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !draftText.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
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
                    {userResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                        {userResults.map((u) => (
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
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>{t('common.cancel', lang)}</Button>
                <Button
                  onClick={() => recipient && openConversation.mutate(recipient.id)}
                  disabled={!recipient || openConversation.isPending}
                >
                  {openConversation.isPending ? t('common.loading', lang) : t('messages.open_chat', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}