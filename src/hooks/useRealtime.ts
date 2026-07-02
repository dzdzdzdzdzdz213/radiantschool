import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  queryKey: string[];
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

// ─── useRealtimeSubscription ─────────────────────────────────
// Subscribes to PostgreSQL changes and auto-invalidates React Query cache

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  queryKey,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();
  const optionsRef = useRef({ queryKey, onInsert, onUpdate, onDelete });
  optionsRef.current = { queryKey, onInsert, onUpdate, onDelete };

  useEffect(() => {
    const channelName = `${table}-changes`;
    const channel = supabase.channel(channelName);

    const changesConfig: any = {
      event: event as any,
      schema: 'public',
      table,
    };
    if (filter) changesConfig.filter = filter;

    const handleChange = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const opts = optionsRef.current;
      switch (payload.eventType) {
        case 'INSERT':
          opts.onInsert?.(payload);
          break;
        case 'UPDATE':
          opts.onUpdate?.(payload);
          break;
        case 'DELETE':
          opts.onDelete?.(payload);
          break;
      }
      queryClient.invalidateQueries({ queryKey: opts.queryKey });
    };

    channel.on('postgres_changes', changesConfig, handleChange);
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter]);
}

// ─── useRealtimeDashboard ────────────────────────────────────
// Subscribe to all critical dashboard tables for live updates

export function useRealtimeDashboard() {
  useRealtimeSubscription({
    table: 'payments',
    event: '*',
    queryKey: ['revenue_chart'],
  });

  useRealtimeSubscription({
    table: 'payments',
    event: '*',
    queryKey: ['payments'],
  });

  useRealtimeSubscription({
    table: 'attendance',
    event: '*',
    queryKey: ['attendance_summary_today'],
  });

  useRealtimeSubscription({
    table: 'attendance',
    event: '*',
    queryKey: ['attendance'],
  });

  useRealtimeSubscription({
    table: 'course_enrollments',
    event: '*',
    queryKey: ['recent_registrations'],
  });

  useRealtimeSubscription({
    table: 'course_enrollments',
    event: '*',
    queryKey: ['enrollments'],
  });

  useRealtimeSubscription({
    table: 'users',
    event: '*',
    queryKey: ['admin_alerts'],
  });

  useRealtimeSubscription({
    table: 'users',
    event: '*',
    queryKey: ['users'],
  });

  useRealtimeSubscription({
    table: 'notifications',
    event: '*',
    queryKey: ['notifications'],
  });

  useRealtimeSubscription({
    table: 'invoices',
    event: '*',
    queryKey: ['invoices'],
  });

  useRealtimeSubscription({
    table: 'courses',
    event: '*',
    queryKey: ['courses'],
  });

  useRealtimeSubscription({
    table: 'courses',
    event: '*',
    queryKey: ['occupancy'],
  });

  useRealtimeSubscription({
    table: 'messages',
    event: '*',
    queryKey: ['messages'],
  });
}
