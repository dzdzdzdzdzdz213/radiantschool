-- Auto-notify parents when a student is marked absent/late.
-- pg_net fires the attendance-parent-notify edge function asynchronously.
CREATE OR REPLACE FUNCTION public.notify_parent_on_attendance_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('absent', 'late') AND NEW.course_schedule_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://kaoxcbqhuwhtadpgccjp.supabase.co/functions/v1/attendance-parent-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer {{ANON_KEY}}'
      ),
      body := jsonb_build_object(
        'student_id', NEW.student_id,
        'course_schedule_id', NEW.course_schedule_id,
        'date', NEW.date
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_parent_attendance ON public.attendance;
CREATE TRIGGER trg_notify_parent_attendance
AFTER INSERT OR UPDATE OF status ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.notify_parent_on_attendance_change();
