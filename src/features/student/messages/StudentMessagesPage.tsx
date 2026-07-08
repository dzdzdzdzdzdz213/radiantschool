import { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, Phone, Video, MessageSquare, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { useSendMessage } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

export default function StudentMessagesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversations, isLoading, isError: conversationsError } = useQuery({
    queryKey: ['student_conversations', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('conversations')
        .select('id, participant:users!participant_id(id, first_name, last_name, photo_url, role), last_message, last_message_at, unread')
        .eq('student_id', profile.id)
        .order('last_message_at', { ascending: false });
      let items = (data ?? []).map((c: any) => ({ ...c, name: `${c.participant?.first_name ?? ''} ${c.participant?.last_name ?? ''}`, role: c.participant?.role ?? '' }));
      if (search) items = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const selectedConv = (conversations ?? []).find((c: any) => c.id === selectedId);

  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: async () => {
      if (!selectedId || !profile?.id) return [];
      const participantId = selectedConv?.participant?.id;
      if (!participantId) return [];
      const { data } = await (supabase as any)
        .from('messages')
        .select('id, body, sender_id, created_at')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });
      return (data ?? []).map((m: any) => ({ ...m, isMine: m.sender_id === profile?.id }));
    },
    enabled: !!selectedId && !!selectedConv?.participant?.id,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (conversationsError) toast(t('errors.load_error', lang, t('nav.messages', lang)), 'error');
  }, [conversationsError]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (messagesError) toast(t('errors.load_error', lang, t('nav.messages', lang)), 'error');
  }, [messagesError]);

  const sendMessage = useSendMessage();

  const handleSend = () => {
    if (!messageText.trim() || !selectedId || !profile?.id) return;
    const participantId = (conversations ?? []).find((c: any) => c.id === selectedId)?.participant?.id;
    if (!participantId) return;
    sendMessage.mutate(
      { receiverId: participantId, subject: '', body: messageText, senderId: profile.id },
      { onSuccess: () => setMessageText('') },
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId || !profile?.id) return;
    try {
      const filePath = `chat/${selectedId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
      const participantId = selectedConv?.participant?.id;
      if (!participantId) return;
      await sendMessage.mutateAsync({ receiverId: participantId, subject: '', body: publicUrl ?? '', senderId: profile.id });
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['student_conversations'] });
    } catch (err: any) {
      toast(err?.message ?? t('common.error', lang), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.messages', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('nav.messages', lang)}</p></div>
      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardContent className="p-3 flex flex-col h-full">
            <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))
              : (conversations ?? []).length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>
              : (conversations ?? []).map((c: any) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left rounded-xl p-3 transition-colors ${selectedId === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.participant?.first_name ?? '', c.participant?.last_name ?? '')}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-xs text-muted-foreground truncate">{c.last_message ?? t('common.select', lang)}</p></div>
                    {c.unread === true && <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">!</span>}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedId ? (
              <>
                <div className="flex items-center justify-between p-4 border-b"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">?</AvatarFallback></Avatar><p className="text-sm font-medium">{t('nav.messages', lang)}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast(t('common.info', lang), 'info')}><Phone className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast(t('common.info', lang), 'info')}><Video className="h-4 w-4" /></Button></div></div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messagesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto'} rounded-2xl`} />)
                  ) : (messagesData ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>
                  ) : (messagesData ?? []).map((m: any) => (
                    <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl ${m.isMine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-accent'} p-3 text-sm`}>
                        {m.body}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t p-3">
                  <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                  <Input placeholder={t('common.send', lang)} value={messageText} onChange={e => setMessageText(e.target.value)} className="h-9" onKeyDown={e => { if (e.key === 'Enter' && !sendMessage.isPending) handleSend(); }} />
                  <Button size="sm" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={sendMessage.isPending || !messageText.trim()}>
                    {sendMessage.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground"><div className="text-center"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm">{t('common.select', lang)}</p></div></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
