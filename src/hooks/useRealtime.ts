import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const WATCHED_TABLES = [
  'announcements',
  'assignment_submissions',
  'assignments',
  'attendance',
  'certificates',
  'course_enrollments',
  'course_schedules',
  'courses',
  'invoices',
  'messages',
  'notifications',
  'online_classes',
  'payments',
  'private_lessons',
  'rfid_scans',
  'teacher_payroll',
  'teacher_reviews',
  'users',
] as const;

// Dashboard queries that aggregate multiple tables or RPC stats:
// they are refetched on any published-table change so every role
// dashboard stays live without a reload.
const DASHBOARD_AGGREGATE_KEYS = [
  ['dashboard_kpi'],
  ['admin_alerts'],
  ['recent_activity'],
  ['recent_registrations'],
  ['assistant_dashboard_kpi'],
  ['assistant_alerts'],
  ['assistant_pending_registrations'],
  ['assistant_overdue_payments'],
  ['assistant_active_teachers'],
  ['teacher-kpi'],
  ['today_schedule'],
  ['assistant_today_schedule'],
  ['teacher-today-schedule'],
  ['teacher-upcoming-courses'],
  ['teacher-recent-enrollments'],
  ['parent-children'],
  ['parent-children-summary'],
  ['parent-stats-summary'],
  ['parent-children-private-lessons'],
  ['student-dashboard'],
  ['student-upcoming'],
  ['child-grades'],
  ['child-enrollments'],
  ['child-profile'],
] as const;

// Query keys that don't match their table name — invalidated alongside it.
const EXTRA_KEYS_BY_TABLE: Record<string, string[][]> = {
  messages: [['chats'], ['chat_messages'], ['chat_users']],
  course_enrollments: [['enrollments']],
};

export function useRealtime() {
  const queryClient = useQueryClient();
  const channels = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    const handleChange = (table: string) => {
      queryClient.invalidateQueries({ queryKey: [table] });
      for (const extra of EXTRA_KEYS_BY_TABLE[table] ?? []) {
        queryClient.invalidateQueries({ queryKey: extra });
      }
      for (const key of DASHBOARD_AGGREGATE_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key[0]] });
      }
    };

    for (const table of WATCHED_TABLES) {
      const channel = supabase
        .channel(table)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => handleChange(table),
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
