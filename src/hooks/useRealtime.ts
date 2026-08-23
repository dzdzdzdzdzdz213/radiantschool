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
  attendance: [
    ['teacher-attendance-counts'],
    ['course-students'],
    ['pending-students'],
    ['teachers_list'],
    ['admin_oversight_private'],
    ['schedule-sessions'],
  ],
  attendance_sessions: [['teacher-attendance-sessions'], ['schedule-sessions']],
  rfid_scans: [['course-students'], ['pending-students']],
};

export function useRealtime() {
  const queryClient = useQueryClient();
  const channels = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    let cancelled = false;

    // Realtime authorizes postgres_changes at SUBSCRIBE time: channels opened
    // before sign-in never receive RLS-protected events. Wait for a session,
    // then subscribe.
    async function waitForSession(): Promise<boolean> {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return true;
      return new Promise((resolve) => {
        let done = false;
        const finish = (v: boolean) => { if (!done) { done = true; resolve(v); } };
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
          if (s) finish(true);
        });
        setTimeout(() => { try { subscription.unsubscribe(); } catch {} finish(false); }, 30000);
      });
    }

    (async () => {
      const authed = await waitForSession();
      if (cancelled || !authed) return;

      const handleChange = (table: string) => {
        queryClient.invalidateQueries({ queryKey: [table] });
        for (const extra of EXTRA_KEYS_BY_TABLE[table] ?? []) {
          queryClient.invalidateQueries({ queryKey: extra });
        }
        for (const key of DASHBOARD_AGGREGATE_KEYS) {
          queryClient.invalidateQueries({ queryKey: [key[0]] });
        }
      };

      // ONE channel with all bindings — duplicate topics (StrictMode double
      // mount) break callback dispatch, a single joined channel does not.
      let channel = supabase.channel('db-changes');
      for (const table of WATCHED_TABLES) {
        channel = channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => handleChange(table),
        );
      }
      channel.subscribe();
      channels.current.push(channel);
    })();

    return () => {
      cancelled = true;
      for (const ch of channels.current) {
        supabase.removeChannel(ch);
      }
      channels.current = [];
    };
  }, [queryClient]);
}
