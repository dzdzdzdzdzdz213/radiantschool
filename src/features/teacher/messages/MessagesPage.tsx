import { useState, useRef } from 'react';
import { Search, Send, Paperclip, User, Phone, Video, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { useSendMessage } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

export default function MessagesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();

  const { data: conversations, isLoading: convLoading } = useQuery({
    queryKey: ['teacher_conversations', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await (supabase as any)
        .from('conversations')
        .select('id, participant:users!participant_id(first_name, last_name, photo_url), last_message, last_message_at, unread')
        .eq('teacher_id', profile.id)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      let items = (data ?? []).map((c: any) => ({ ...c, name: `${c.participant?.first_name ?? ''} ${c.participant?.last_name ?? ''}` }));
      if (search) items = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const { data: messages, isLoading: msgLoading } = useQuery({
    queryKey: ['teacher_messages', selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data, error } = await (supabase as any)
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!selectedId,
  });

  const selectedConv = (conversations ?? []).find((c: any) => c.id === selectedId);

  const handleSend = () => {
    if (!message.trim() || !selectedId || !profile?.id) return;
    sendMessage.mutate({ conversationId: selectedId, content: message.trim(), senderId: profile.id });
    setMessage('');
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
      await sendMessage.mutateAsync({ conversationId: selectedId, content: publicUrl ?? '', senderId: profile.id });
      toast('Fichier envoyé', 'success');
    } catch (err: any) {
      toast(err?.message ?? 'Erreur lors de l\'envoi du fichier', 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Messages</h1><p className="text-sm text-muted-foreground mt-1">Discuter avec vos élèves et collègues</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
            </div>
            <div className="space-y-1">
              {convLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))
              : (conversations ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
              ) : (conversations ?? []).map((c: any) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left rounded-xl p-3 transition-colors ${selectedId === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.participant?.first_name ?? '', c.participant?.last_name ?? '')}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.last_message ?? 'Démarrer une conversation'}</p>
                    </div>
                    {c.unread > 0 && <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">{c.unread}</span>}
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
                  <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{(selectedConv?.participant?.first_name?.[0] ?? '?').toUpperCase()}</AvatarFallback></Avatar><p className="text-sm font-medium">{selectedConv?.name ?? 'Contact'}</p></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast('Fonctionnalité à venir', 'info')}><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => toast('Fonctionnalité à venir', 'info')}><Video className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {msgLoading ? Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-12 rounded-2xl max-w-[70%]" />))
                  : (messages ?? []).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Démarrer la conversation</div>
                  ) : (messages ?? []).map((m: any) => (
                    <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${m.sender_id === profile?.id ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-accent'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t p-3">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0" onClick={handleFileClick} disabled={uploadingFile}><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder="Écrivez votre message..." value={message} onChange={e => setMessage(e.target.value)} className="h-9" onKeyDown={handleKeyDown} />
                  <Button size="sm" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={sendMessage.isPending || !message.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm">Sélectionnez une conversation</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
