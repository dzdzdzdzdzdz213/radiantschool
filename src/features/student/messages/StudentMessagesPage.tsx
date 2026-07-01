import { useState } from 'react';
import { Search, Send, Paperclip, Phone, Video, MessageSquare, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';

export default function StudentMessagesPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['student_conversations', profile?.id, search],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('conversations')
        .select('id, participant:users!participant_id(first_name, last_name, photo_url, role), last_message, last_message_at, unread')
        .eq('student_id', profile.id)
        .order('last_message_at', { ascending: false });
      let items = (data ?? []).map((c: any) => ({ ...c, name: `${c.participant?.first_name ?? ''} ${c.participant?.last_name ?? ''}`, role: c.participant?.role ?? '' }));
      if (search) items = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Messages</h1><p className="text-sm text-muted-foreground mt-1">Échangez avec vos professeurs et le centre</p></div>
      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardContent className="p-3 flex flex-col h-full">
            <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" /></div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))
              : (conversations ?? []).length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Aucune conversation</p>
              : (conversations ?? []).map((c: any) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left rounded-xl p-3 transition-colors ${selectedId === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(c.participant?.first_name ?? '', c.participant?.last_name ?? '')}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-xs text-muted-foreground truncate">{c.last_message ?? 'Cliquez pour discuter'}</p></div>
                    {c.unread > 0 && <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">{c.unread}</span>}
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
                <div className="flex items-center justify-between p-4 border-b"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">?</AvatarFallback></Avatar><p className="text-sm font-medium">Contact</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-8 w-8"><Phone className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-8 w-8"><Video className="h-4 w-4" /></Button></div></div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  <div className="flex justify-start"><div className="max-w-[70%] rounded-2xl rounded-bl-sm bg-accent p-3 text-sm">Bonjour! Comment puis-je vous aider?</div></div>
                  <div className="flex justify-end"><div className="max-w-[70%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground p-3 text-sm">Je voudrais des informations sur mon cours.</div></div>
                </div>
                <div className="flex items-center gap-2 border-t p-3"><Button variant="ghost" size="sm" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4" /></Button><Input placeholder="Écrivez votre message..." value={messageText} onChange={e => setMessageText(e.target.value)} className="h-9" onKeyDown={e => { if (e.key === 'Enter') { setMessageText(''); } }} /><Button size="sm" className="h-9 w-9 shrink-0"><Send className="h-4 w-4" /></Button></div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground"><div className="text-center"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" /><p className="text-sm">Sélectionnez une conversation</p></div></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}