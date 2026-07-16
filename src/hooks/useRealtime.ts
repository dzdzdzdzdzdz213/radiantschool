import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const WATCHED_TABLES = [
  'attendance',
  'notifications',
  'messages',
  'conversations',
  'course_enrollments',
  'payments',
] as const;

export function useRealtime() {
  const queryClient = useQueryClient();
  const channels = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    for (const table of WATCHED_TABLES) {
      const channel = supabase
        .channel(table)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => queryClient.invalidateQueries({ queryKey: [table] }),
        )
        .subscribe();

      channels.current.push(channel);
    }

    return () => {
      for (const ch of channels.current) {
        supabase.removeChannel(ch);
      }
      channels.current = [];
    };
  }, [queryClient]);
}
