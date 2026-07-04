import { useState } from 'react';
import { useMessages } from '@/hooks/useQueries';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function MessagesPage() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: messages, isLoading } = useMessages();
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [reply, setReply] = useState('');

  const filtered = (messages ?? []).filter((m: any) => m.sender_id === profile?.id || m.receiver_id === profile?.id);

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
    onError: (err: any) => toast(err?.message ?? t('errors.unknown', lang), 'error'),
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">{t('nav.messages', lang)}</h2>
        </div>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 57px)' }}>
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted">{t('common.loading', lang)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">{t('common.no_data', lang)}</p>
            </div>
          ) : (
            filtered.map((m: any) => {
              const isSent = m.sender_id === profile?.id;
              const other = isSent ? m.receiver : m.sender;
              return (
                <div
                  key={m.id}
                  className={`cursor-pointer border-b p-4 text-sm hover:bg-page ${!m.is_read && !isSent ? 'bg-notification' : ''}`}
                  onClick={() => { setSelectedMsg(m); setReply(''); }}
                >
                  <p className="font-medium">{other ? getFullName(other.first_name, other.last_name) : t('common.not_found', lang)}</p>
                  <p className="truncate text-muted">{m.subject || t('common.no_data', lang)}</p>
                  <p className="text-xs text-muted">{formatDateTime(m.created_at)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card shadow-sm">
        {selectedMsg ? (
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h3 className="font-semibold">{selectedMsg.subject || t('common.no_data', lang)}</h3>
              <p className="text-sm text-muted">
                {selectedMsg.sender_id === profile?.id ? 'Vous' : getFullName(selectedMsg.sender?.first_name || '', selectedMsg.sender?.last_name || '')}
                {' · '}{formatDateTime(selectedMsg.created_at)}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm">{selectedMsg.body}</p>
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Écrire un message..." className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90" onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !reply.trim()}><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-12 w-12" />
              <p>{t('common.select', lang)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
