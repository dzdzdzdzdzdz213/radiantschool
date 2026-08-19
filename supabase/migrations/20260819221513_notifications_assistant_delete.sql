-- Allow assistant to delete notifications (NotificationsPage delete flow)
DROP POLICY IF EXISTS notifications_assistant_delete ON public.notifications;

CREATE POLICY notifications_assistant_delete ON public.notifications
  FOR DELETE TO authenticated
  USING (is_assistant());