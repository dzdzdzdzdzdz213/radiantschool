import { useState } from 'react';
import { Bell, Calendar, CheckCheck, Trash2, AlertCircle, Info, Megaphone, DollarSign, MessageSquare, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useMarkNotificationsRead, useDeleteNotification } from '@/hooks/useMutationFeedback';
import { useErrorToast } from '@/hooks/useErrorToast';

const typeIcons: Record<string, any> = { alert: AlertCircle, info: Info, announcement: Megaphone, payment: DollarSign, message: MessageSquare };
const typeColors: Record<string, string> = { alert: 'text-red-500 bg-red-500/10', info: 'text-blue-500 bg-blue-500/10', announcement: 'text-violet-500 bg-violet-500/10', payment: 'text-emerald-500 bg-emerald-500/10', message: 'text-sky-500 bg-sky-500/10' };

export default function StudentNotificationsPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [tab, setTab] = useState('all');

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['student_notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!profile?.id,
  });
  useErrorToast(isError, lang, t('nav.notifications', lang));

  const markRead = useMarkNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const filtered = tab === 'unread' ? (notifications ?? []).filter((n: any) => !n.is_read) : notifications ?? [];
  const unreadCount = (notifications ?? []).filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.notifications', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{unreadCount} {t('common.not_found', lang)}</p></div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => { if (profile?.id) markRead.mutate({ userId: profile.id }); }} disabled={markRead.isPending || unreadCount === 0}>
          {markRead.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}{t('common.confirm', lang)}
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-0"><Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="all">{t('common.all', lang)}</TabsTrigger><TabsTrigger value="unread">{t('common.none', lang)} {unreadCount > 0 && <Badge variant="default" className="ml-1.5 text-[9px] h-4 px-1">{unreadCount}</Badge>}</TabsTrigger></TabsList></Tabs></CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-20 rounded-xl" />))
            : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p></div>
            ) : filtered.map((n: any) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const color = typeColors[n.type] ?? 'text-primary bg-primary/10';
              return (
                <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-4 transition-colors group ${!n.is_read ? 'bg-accent/50 border-primary/20' : ''}`}>
                  <div className={`h-9 w-9 rounded-xl ${color.split(' ')[1]} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium">{n.title}</p>{!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}</div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(n.created_at)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => deleteNotif.mutate(n.id)} disabled={deleteNotif.isPending}>
                    {deleteNotif.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
