import { useState, useRef } from 'react';
import { Search, Send, Paperclip, Phone, Video, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { useSendMessage } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function MessagesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();

  const { data: conversations, isLoading: convLoading, isError: convError } = useQuery({
    queryKey: ['teacher_conversations', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await (supabase as any)
        .from('conversations')
        .select('id, participant:users!participant_id(id, first_name, last_name, photo_url), last_message, last_message_at, unread')
        .eq('teacher_id', profile.id)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      let items = (data ?? []).map((c: any) => ({ ...c, name: `${c.participant?.first_name ?? ''} ${c.participant?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  useErrorToast(convError, lang, t('nav.messages', lang));
  const selectedConv = (conversations ?? []).find((c: any) => c.id === selectedId);

  const { data: messages, isLoading: msgLoading, isError: msgError } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: async () => {
      if (!selectedId || !profile?.id) return [];
      const participantId = selectedConv?.participant?.id;
      if (!participantId) return [];
      const { data, error } = await (supabase as any)
        .from('messages')
        .select('id, body, sender_id, created_at')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedId && !!selectedConv?.participant?.id,
  });
  useErrorToast(msgError, lang, t('nav.messages', lang));

  const handleSend = () => {
    if (!message.trim() || !selectedId || !profile?.id) return;
    const participantId = selectedConv?.participant?.id;
    if (!participantId) return;
    const body = message.trim();
    sendMessage.mutate(
      { receiverId: participantId, subject: '', body, senderId: profile.id },
      { onSuccess: () => setMessage('') },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId || !profile?.id) return;
    setUploadingFile(true);
    try {
      const filePath = `chat/${selectedId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
      const participantId = selectedConv?.participant?.id;
      if (!participantId) return;
      await sendMessage.mutateAsync({ receiverId: participantId, subject: '', body: publicUrl ?? '', senderId: profile.id });
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['teacher_conversations'] });
      toast(t('success.sent', lang, 'Fichier'), 'success');
    } catch (err: any) {
      toast(err?.message ?? t('common.error', lang), 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.messages', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
            </div>
            <div className="space-y-1">
              {convLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))
              : (conversations ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">{t('common.no_data', lang)}</p>
              ) : (conversations ?? []).map((c: any) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left rounded-xl p-3 transition-colors ${selectedId === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.participant?.first_name ?? '', c.participant?.last_name ?? '')}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.last_message ?? t('common.send', lang)}</p>
                    </div>
                    {c.unread === true && <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">!</span>}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-[500px]">
            {selectedId ? (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{(selectedConv?.participant?.first_name?.[0] ?? '?').toUpperCase()}</AvatarFallback></Avatar><p className="text-sm font-medium">{selectedConv?.name ?? t('common.name', lang)}</p></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast(t('common.info', lang), 'info')}><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast(t('common.info', lang), 'info')}><Video className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {msgLoading ? Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-12 rounded-2xl max-w-[70%]" />))
                  : (messages ?? []).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.send', lang)}</div>
                  ) : (messages ?? []).map((m: any) => (
                    <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${m.sender_id === profile?.id ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-accent'}`}>
                        {m.body}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t p-3">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0" onClick={handleFileClick} disabled={uploadingFile}><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder={t('common.send', lang)} value={message} onChange={e => setMessage(e.target.value)} className="h-9" onKeyDown={handleKeyDown} />
                  <Button size="sm" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={sendMessage.isPending || !message.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm">{t('common.select', lang)}</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
