import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useBrowserNotifications(userId?: string | null) {
  const shown = useRef(new Set<number>());

  useEffect(() => {
    if (!userId || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('browser-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as any;
          if (shown.current.has(n.id)) return;
          shown.current.add(n.id);

          if (Notification.permission === 'granted' && !document.hasFocus()) {
            new Notification(n.title, { body: n.message, icon: '/icons/icon-192.svg' });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}
