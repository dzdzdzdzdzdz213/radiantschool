import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData.split('').map(c => c.charCodeAt(0)));
}

export function usePushNotifications(userId?: string | null) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || !userId) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ) as unknown as BufferSource,
      });

      const json = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: json.endpoint!,
        p256dh_key: json.keys!.p256dh,
        auth_key: json.keys!.auth,
        user_agent: navigator.userAgent,
      });

      if (!error) setSubscribed(true);
    } catch (e) {
      console.error('[PUSH] Subscribe failed:', e);
    }
  }, [supported, userId]);

  const unsubscribe = useCallback(async () => {
    if (!supported || !userId) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await supabase.from('push_subscriptions').delete().eq('user_id', userId);
      setSubscribed(false);
    } catch (e) {
      console.error('[PUSH] Unsubscribe failed:', e);
    }
  }, [supported, userId]);

  return { supported, permission, subscribed, subscribe, unsubscribe };
}
