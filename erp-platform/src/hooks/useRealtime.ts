import { useEffect, useCallback, useRef } from 'react';
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
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload);
          break;
        case 'UPDATE':
          onUpdate?.(payload);
          break;
        case 'DELETE':
          onDelete?.(payload);
          break;
      }
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    [queryClient, queryKey, onInsert, onUpdate, onDelete],
  );

  const subscribe = useCallback(() => {
    const channelName = `${table}-changes-${Date.now()}`;
    const channel = supabase.channel(channelName);

    const changesConfig: any = {
      event: event as any,
      schema: 'public',
      table,
    };
    if (filter) changesConfig.filter = filter;

    channel.on(
      'postgres_changes',
      changesConfig,
      handleChange,
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, handleChange]);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [subscribe]);
}

// ─── useRealtimePresence ─────────────────────────────────────
// Tracks online/offline presence of users

export function useRealtimePresence(room: string = 'online-users') {
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();
  const presenceRef = useRef<Set<string>>(new Set());

  const track = useCallback(async (userData: { user_id: string; name: string }) => {
    const channel = supabase.channel(room, {
      config: { presence: { key: userData.user_id } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      presenceRef.current = new Set(Object.keys(newState));
    });

    channel.on('presence', { event: 'join' }, ({ key }) => {
      presenceRef.current.add(key as string);
    });

    channel.on('presence', { event: 'leave' }, ({ key }) => {
      presenceRef.current.delete(key as string);
    });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userData);
      }
    });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [room]);

  const getOnlineUsers = useCallback(() => {
    return Array.from(presenceRef.current);
  }, []);

  return { track, getOnlineUsers };
}

// ─── useRealtimeBroadcast ────────────────────────────────────
// Send and receive real-time messages between users

interface BroadcastPayload {
  event: string;
  data: Record<string, unknown>;
  target?: string;
}

export function useRealtimeBroadcast(channelName: string) {
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();
  const handlersRef = useRef<Map<string, (payload: BroadcastPayload) => void>>(new Map());

  useEffect(() => {
    const ch = supabase.channel(channelName);
    ch.subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [channelName]);

  const send = useCallback((event: string, data: Record<string, unknown>, target?: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event,
      payload: { event, data, target },
    });
  }, []);

  const on = useCallback((event: string, handler: (payload: BroadcastPayload) => void) => {
    handlersRef.current.set(event, handler);
    channelRef.current?.on('broadcast', { event }, (payload) => {
      handler(payload as any);
    });
  }, []);

  const off = useCallback((event: string) => {
    handlersRef.current.delete(event);
  }, []);

  return { send, on, off };
}

// ─── useRealtimeDashboard ────────────────────────────────────
// Subscribe to all critical dashboard tables for live updates

export function useRealtimeDashboard() {
  useRealtimeSubscription({
    table: 'payments',
    queryKey: ['revenue_chart'],
  });

  useRealtimeSubscription({
    table: 'attendance',
    event: 'INSERT',
    queryKey: ['attendance_summary_today'],
  });

  useRealtimeSubscription({
    table: 'course_enrollments',
    event: 'INSERT',
    queryKey: ['recent_registrations'],
  });

  useRealtimeSubscription({
    table: 'users',
    event: 'UPDATE',
    filter: 'status=eq.pending',
    queryKey: ['admin_alerts'],
  });

  useRealtimeSubscription({
    table: 'notifications',
    event: 'INSERT',
    queryKey: ['notifications'],
  });

  useRealtimeSubscription({
    table: 'dashboard_kpi',
    queryKey: ['dashboard_kpi'],
  });
}
